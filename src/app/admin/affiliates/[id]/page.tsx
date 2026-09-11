import { createAdminClient } from "@/lib/supabase/admin";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentAdmin } from "@/lib/actions/admin-auth";

async function updateCommissionRate(affiliateId: string, formData: FormData) {
  "use server";

  const rateRaw = String(formData.get("commission_rate") || "");
  const rate = Number(rateRaw);

  if (Number.isNaN(rate) || rate < 0 || rate > 100) {
    redirect(`/admin/affiliates/${affiliateId}?error=invalid_rate`);
  }

  const supabaseAdmin = createAdminClient();

  const { error } = await supabaseAdmin
    .from("affiliates")
    .update({ commission_rate: rate })
    .eq("id", affiliateId);

  if (error) {
    redirect(`/admin/affiliates/${affiliateId}?error=rate_update_failed`);
  }

  redirect(`/admin/affiliates/${affiliateId}?rateSaved=1`);
}

async function markOrderPaid(affiliateId: string, orderId: string) {
  "use server";

  const supabaseAdmin = createAdminClient();

  const { error } = await supabaseAdmin
    .from("orders")
    .update({ commission_paid: true })
    .eq("id", orderId);

  if (error) {
    redirect(`/admin/affiliates/${affiliateId}?error=mark_paid_failed`);
  }

  redirect(`/admin/affiliates/${affiliateId}?paid=1`);
}

async function updateBankInfo(affiliateId: string, formData: FormData) {
  "use server";

  const bankName = String(formData.get("bank_name") || "").trim();
  const bankAccountNumber = String(formData.get("bank_account_number") || "").trim();
  const bankAccountName = String(formData.get("bank_account_name") || "").trim();

  const supabaseAdmin = createAdminClient();

  const { error } = await supabaseAdmin
    .from("affiliates")
    .update({
      bank_name: bankName || null,
      bank_account_number: bankAccountNumber || null,
      bank_account_name: bankAccountName || null,
    })
    .eq("id", affiliateId);

  if (error) {
    redirect(`/admin/affiliates/${affiliateId}?error=bank_update_failed`);
  }

  redirect(`/admin/affiliates/${affiliateId}?bankSaved=1`);
}

export default async function AdminAffiliateDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    error?: string;
    rateSaved?: string;
    paid?: string;
    bankSaved?: string;
  }>;
}) {
  const { id } = await params;
  const { error, rateSaved, paid, bankSaved } = await searchParams;

  const currentAdmin = await getCurrentAdmin();
  if (currentAdmin?.role !== "owner") {
    redirect("/admin?error=forbidden");
  }

  const supabaseAdmin = createAdminClient();

  const { data: affiliate } = await supabaseAdmin
    .from("affiliates")
    .select(
      "id, full_name, phone, referral_code, commission_rate, status, bank_name, bank_account_number, bank_account_name"
    )
    .eq("id", id)
    .single();

  if (!affiliate) notFound();

  const { data: orders } = await supabaseAdmin
    .from("orders")
    .select("id, order_number, subtotal, commission_paid, status, created_at")
    .eq("referred_by_affiliate_id", id)
    .order("created_at", { ascending: false });

  const allOrders = orders ?? [];
  const totalRevenue = allOrders.reduce((sum, o) => sum + o.subtotal, 0);
  const unpaidOrders = allOrders.filter((o) => !o.commission_paid);
  const unpaidRevenue = unpaidOrders.reduce((sum, o) => sum + o.subtotal, 0);
  const totalCommission = (totalRevenue * affiliate.commission_rate) / 100;
  const unpaidCommission = (unpaidRevenue * affiliate.commission_rate) / 100;

  const boundUpdateRate = updateCommissionRate.bind(null, affiliate.id);
  const boundUpdateBankInfo = updateBankInfo.bind(null, affiliate.id);

  const waPhone = affiliate.phone.replace(/[^0-9]/g, "").replace(/^0/, "62");
  const waMessage = encodeURIComponent(
    `Halo ${affiliate.full_name}, komisi affiliate kamu sebesar Rp${totalCommission.toLocaleString(
      "id-ID"
    )} sudah kami kirim ke rekening ${affiliate.bank_name ?? "-"} a.n. ${
      affiliate.bank_account_name ?? "-"
    } (${affiliate.bank_account_number ?? "-"}). Terima kasih sudah menjadi partner Corvus!`
  );
  const waLink = `https://wa.me/${waPhone}?text=${waMessage}`;

  return (
    <div>
      <div className="flex items-center justify-between border-b border-border pb-6">
        <div>
          <h1 className="font-display text-3xl tracking-editorial">{affiliate.full_name}</h1>
          <p className="mt-1 text-sm text-ink-soft">
            {affiliate.phone} · Kode: {affiliate.referral_code ?? "-"}
          </p>
        </div>
        <Link href="/admin/affiliates" className="text-xs tracking-editorial uppercase underline">
          Back to Affiliates
        </Link>
      </div>

      {rateSaved && (
        <p className="mt-4 border border-green-700 bg-green-50 px-4 py-2 text-sm text-green-700">
          Rate komisi disimpan.
        </p>
      )}
      {paid && (
        <p className="mt-4 border border-green-700 bg-green-50 px-4 py-2 text-sm text-green-700">
          Order ditandai sudah dibayar.
        </p>
      )}
      {bankSaved && (
        <p className="mt-4 border border-green-700 bg-green-50 px-4 py-2 text-sm text-green-700">
          Info rekening disimpan.
        </p>
      )}
      {error && (
        <p className="mt-4 border border-red-600 bg-red-50 px-4 py-2 text-sm text-red-600">
          Terjadi kesalahan, coba lagi.
        </p>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block border border-ink px-4 py-2 text-xs tracking-editorial uppercase hover:bg-ink hover:text-off-white transition-colors"
        >
          Kabari via WhatsApp
        </a>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="border border-border bg-off-white-soft p-4">
          <p className="text-xs tracking-editorial uppercase text-ink-soft">Total Order</p>
          <p className="mt-1 font-display text-2xl">{allOrders.length}</p>
        </div>
        <div className="border border-border bg-off-white-soft p-4">
          <p className="text-xs tracking-editorial uppercase text-ink-soft">Total Omzet</p>
          <p className="mt-1 font-display text-2xl">Rp{totalRevenue.toLocaleString("id-ID")}</p>
        </div>
        <div className="border border-border bg-off-white-soft p-4">
          <p className="text-xs tracking-editorial uppercase text-ink-soft">Total Komisi</p>
          <p className="mt-1 font-display text-2xl">Rp{totalCommission.toLocaleString("id-ID")}</p>
        </div>
        <div className="border border-ink bg-ink p-4 text-off-white">
          <p className="text-xs tracking-editorial uppercase text-off-white/70">Belum Dibayar</p>
          <p className="mt-1 font-display text-2xl">Rp{unpaidCommission.toLocaleString("id-ID")}</p>
        </div>
      </div>

      <div className="mt-10 border border-border bg-off-white-soft p-6">
        <h2 className="text-xs tracking-editorial uppercase text-ink-soft">Commission Rate</h2>
        <form action={boundUpdateRate} className="mt-4 flex items-end gap-3">
          <div>
            <label className="text-xs tracking-editorial uppercase text-ink-soft">Persen (%)</label>
            <input
              name="commission_rate"
              type="number"
              min="0"
              max="100"
              step="0.5"
              defaultValue={affiliate.commission_rate}
              required
              className="mt-1 w-32 border border-border bg-off-white px-3 py-2 text-sm"
            />
          </div>
          <button
            type="submit"
            className="border border-ink bg-ink px-4 py-2 text-xs tracking-editorial uppercase text-off-white hover:bg-ink-soft transition-colors"
          >
            Save Rate
          </button>
        </form>
      </div>

      <div className="mt-8 border border-border bg-off-white-soft p-6">
        <h2 className="text-xs tracking-editorial uppercase text-ink-soft">Info Rekening</h2>
        <form action={boundUpdateBankInfo} className="mt-4 flex flex-wrap items-end gap-3">
          <div>
            <label className="text-xs tracking-editorial uppercase text-ink-soft">Nama Bank</label>
            <input
              name="bank_name"
              type="text"
              defaultValue={affiliate.bank_name ?? ""}
              placeholder="BCA"
              className="mt-1 w-40 border border-border bg-off-white px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs tracking-editorial uppercase text-ink-soft">
              Nomor Rekening
            </label>
            <input
              name="bank_account_number"
              type="text"
              defaultValue={affiliate.bank_account_number ?? ""}
              placeholder="1234567890"
              className="mt-1 w-48 border border-border bg-off-white px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs tracking-editorial uppercase text-ink-soft">
              Nama Pemilik Rekening
            </label>
            <input
              name="bank_account_name"
              type="text"
              defaultValue={affiliate.bank_account_name ?? ""}
              placeholder="Sesuai buku tabungan"
              className="mt-1 w-56 border border-border bg-off-white px-3 py-2 text-sm"
            />
          </div>
          <button
            type="submit"
            className="border border-ink bg-ink px-4 py-2 text-xs tracking-editorial uppercase text-off-white hover:bg-ink-soft transition-colors"
          >
            Save Rekening
          </button>
        </form>
      </div>

      <div className="mt-10">
        <h2 className="border-b border-stone pb-2 text-xs tracking-editorial uppercase text-ink-soft">
          Riwayat Order
        </h2>

        {allOrders.length === 0 ? (
          <p className="mt-4 text-sm text-stone-dark">Belum ada order dari affiliate ini.</p>
        ) : (
          <div className="mt-4 overflow-x-auto border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-off-white-soft text-left text-xs tracking-editorial uppercase text-ink-soft">
                  <th className="py-3 pl-4 pr-4">Order</th>
                  <th className="py-3 pr-4">Tanggal</th>
                  <th className="py-3 pr-4">Subtotal</th>
                  <th className="py-3 pr-4">Komisi</th>
                  <th className="py-3 pr-4">Status Bayar</th>
                  <th className="py-3 pr-4"></th>
                </tr>
              </thead>
              <tbody>
                {allOrders.map((o) => {
                  const commission = (o.subtotal * affiliate.commission_rate) / 100;
                  const boundMarkPaid = markOrderPaid.bind(null, affiliate.id, o.id);
                  return (
                    <tr key={o.id} className="border-b border-border last:border-0 hover:bg-off-white-soft">
                      <td className="py-3 pl-4 pr-4 font-medium">{o.order_number}</td>
                      <td className="py-3 pr-4 text-ink-soft">
                        {new Date(o.created_at).toLocaleDateString("id-ID")}
                      </td>
                      <td className="py-3 pr-4 text-ink-soft">
                        Rp{o.subtotal.toLocaleString("id-ID")}
                      </td>
                      <td className="py-3 pr-4 text-ink-soft">
                        Rp{commission.toLocaleString("id-ID")}
                      </td>
                      <td className="py-3 pr-4">
                        {o.commission_paid ? (
                          <span className="text-green-700">Sudah dibayar</span>
                        ) : (
                          <span className="text-ink-soft">Belum dibayar</span>
                        )}
                      </td>
                      <td className="py-3 pr-4 text-right">
                        {!o.commission_paid && (
                          <form action={boundMarkPaid}>
                            <button
                              type="submit"
                              className="border border-ink px-3 py-1.5 text-xs tracking-editorial uppercase hover:bg-ink hover:text-off-white transition-colors"
                            >
                              Tandai Dibayar
                            </button>
                          </form>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
