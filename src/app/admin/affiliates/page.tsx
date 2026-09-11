import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentAdmin } from "@/lib/actions/admin-auth";

function generateReferralCode(fullName: string) {
  const base = fullName
    .toUpperCase()
    .replace(/[^A-Z]/g, "")
    .slice(0, 6) || "AFF";
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `${base}${suffix}`;
}

async function approveAffiliate(affiliateId: string) {
  "use server";

  const supabaseAdmin = createAdminClient();

  const { data: affiliate } = await supabaseAdmin
    .from("affiliates")
    .select("full_name")
    .eq("id", affiliateId)
    .single();

  if (!affiliate) {
    redirect("/admin/affiliates?error=not_found");
  }

  let referralCode = generateReferralCode(affiliate.full_name);

  // Pastikan kode unik, coba beberapa kali kalau bentrok
  for (let attempt = 0; attempt < 5; attempt++) {
    const { data: existing } = await supabaseAdmin
      .from("affiliates")
      .select("id")
      .eq("referral_code", referralCode)
      .maybeSingle();

    if (!existing) break;
    referralCode = generateReferralCode(affiliate.full_name);
  }

  const { error } = await supabaseAdmin
    .from("affiliates")
    .update({
      status: "approved",
      referral_code: referralCode,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", affiliateId);

  if (error) {
    redirect("/admin/affiliates?error=approve_failed");
  }

  redirect("/admin/affiliates?approved=1");
}

async function rejectAffiliate(affiliateId: string) {
  "use server";

  const supabaseAdmin = createAdminClient();

  const { error } = await supabaseAdmin
    .from("affiliates")
    .update({
      status: "rejected",
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", affiliateId);

  if (error) {
    redirect("/admin/affiliates?error=reject_failed");
  }

  redirect("/admin/affiliates?rejected=1");
}

export default async function AdminAffiliatesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; approved?: string; rejected?: string }>;
}) {
  const { error, approved, rejected } = await searchParams;

  const currentAdmin = await getCurrentAdmin();
  if (currentAdmin?.role !== "owner") {
    redirect("/admin?error=forbidden");
  }

  const supabaseAdmin = createAdminClient();

  const { data: affiliates, error: fetchError } = await supabaseAdmin
    .from("affiliates")
    .select("id, full_name, phone, status, referral_code, created_at, commission_rate")
    .order("created_at", { ascending: false });

  if (fetchError) {
    return <p className="text-sm text-red-600">Gagal memuat affiliates: {fetchError.message}</p>;
  }

  const pending = affiliates?.filter((a) => a.status === "pending") ?? [];
  const others = affiliates?.filter((a) => a.status !== "pending") ?? [];

  const approvedIds = others.filter((a) => a.status === "approved").map((a) => a.id);

  const performanceByAffiliate = new Map<string, { orderCount: number; totalRevenue: number; unpaidRevenue: number }>();

  if (approvedIds.length > 0) {
    const { data: referredOrders } = await supabaseAdmin
      .from("orders")
      .select("referred_by_affiliate_id, subtotal, commission_paid")
      .in("referred_by_affiliate_id", approvedIds);

    for (const order of referredOrders ?? []) {
      if (!order.referred_by_affiliate_id) continue;
      const current = performanceByAffiliate.get(order.referred_by_affiliate_id) ?? {
        orderCount: 0,
        totalRevenue: 0,
        unpaidRevenue: 0,
      };
      current.orderCount += 1;
      current.totalRevenue += order.subtotal;
      if (!order.commission_paid) {
        current.unpaidRevenue += order.subtotal;
      }
      performanceByAffiliate.set(order.referred_by_affiliate_id, current);
    }
  }

  return (
    <div>
      <h1 className="font-display text-3xl tracking-editorial border-b border-border pb-6">Affiliates</h1>

      {approved && (
        <p className="mt-4 border border-green-700 bg-green-50 px-4 py-2 text-sm text-green-700">
          Affiliate disetujui.
        </p>
      )}
      {rejected && (
        <p className="mt-4 border border-green-700 bg-green-50 px-4 py-2 text-sm text-green-700">
          Affiliate ditolak.
        </p>
      )}
      {error && (
        <p className="mt-4 border border-red-600 bg-red-50 px-4 py-2 text-sm text-red-600">
          Terjadi kesalahan, coba lagi.
        </p>
      )}

      <div className="mt-8">
        <h2 className="border-b border-stone pb-2 text-xs tracking-editorial uppercase text-ink-soft">
          Menunggu Peninjauan ({pending.length})
        </h2>

        {pending.length === 0 ? (
          <p className="mt-4 text-sm text-stone-dark">Tidak ada pendaftaran baru.</p>
        ) : (
          <div className="mt-4 overflow-x-auto border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-off-white-soft text-left text-xs tracking-editorial uppercase text-ink-soft">
                  <th className="py-3 pl-4 pr-4">Nama</th>
                  <th className="py-3 pr-4">Telepon</th>
                  <th className="py-3 pr-4">Daftar Pada</th>
                  <th className="py-3 pr-4"></th>
                </tr>
              </thead>
              <tbody>
                {pending.map((a) => {
                  const boundApprove = approveAffiliate.bind(null, a.id);
                  const boundReject = rejectAffiliate.bind(null, a.id);
                  return (
                    <tr key={a.id} className="border-b border-border last:border-0 hover:bg-off-white-soft">
                      <td className="py-3 pl-4 pr-4 font-medium">{a.full_name}</td>
                      <td className="py-3 pr-4 text-ink-soft">{a.phone}</td>
                      <td className="py-3 pr-4 text-ink-soft">
                        {new Date(a.created_at).toLocaleDateString("id-ID")}
                      </td>
                      <td className="py-3 pr-4 text-right">
                        <div className="flex justify-end gap-2">
                          <form action={boundApprove}>
                            <button
                              type="submit"
                              className="border border-ink px-3 py-1.5 text-xs tracking-editorial uppercase hover:bg-ink hover:text-off-white transition-colors"
                            >
                              Setujui
                            </button>
                          </form>
                          <form action={boundReject}>
                            <button
                              type="submit"
                              className="border border-red-600 px-3 py-1.5 text-xs tracking-editorial uppercase text-red-600 hover:bg-red-600 hover:text-off-white transition-colors"
                            >
                              Tolak
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-10">
        <h2 className="border-b border-stone pb-2 text-xs tracking-editorial uppercase text-ink-soft">Riwayat</h2>

        {others.length === 0 ? (
          <p className="mt-4 text-sm text-stone-dark">Belum ada riwayat.</p>
        ) : (
          <div className="mt-4 overflow-x-auto border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-off-white-soft text-left text-xs tracking-editorial uppercase text-ink-soft">
                  <th className="py-3 pl-4 pr-4">Nama</th>
                  <th className="py-3 pr-4">Telepon</th>
                  <th className="py-3 pr-4">Status</th>
                  <th className="py-3 pr-4">Kode Referral</th>
                  <th className="py-3 pr-4">Rate</th>
                  <th className="py-3 pr-4">Order</th>
                  <th className="py-3 pr-4">Omzet</th>
                  <th className="py-3 pr-4">Komisi Belum Dibayar</th>
                  <th className="py-3 pr-4"></th>
                </tr>
              </thead>
              <tbody>
                {others.map((a) => {
                  const perf = performanceByAffiliate.get(a.id);
                  const unpaidCommission = ((perf?.unpaidRevenue ?? 0) * a.commission_rate) / 100;
                  return (
                    <tr key={a.id} className="border-b border-border last:border-0 hover:bg-off-white-soft">
                      <td className="py-3 pl-4 pr-4 font-medium">{a.full_name}</td>
                      <td className="py-3 pr-4 text-ink-soft">{a.phone}</td>
                      <td className="py-3 pr-4 capitalize text-ink-soft">{a.status}</td>
                      <td className="py-3 pr-4 text-ink-soft">{a.referral_code ?? "-"}</td>
                      <td className="py-3 pr-4 text-ink-soft">{a.commission_rate}%</td>
                      <td className="py-3 pr-4 text-ink-soft">{perf?.orderCount ?? 0}</td>
                      <td className="py-3 pr-4 text-ink-soft">
                        Rp{(perf?.totalRevenue ?? 0).toLocaleString("id-ID")}
                      </td>
                      <td className="py-3 pr-4 text-ink-soft">
                        Rp{unpaidCommission.toLocaleString("id-ID")}
                      </td>
                      <td className="py-3 pr-4 text-right">
                        {a.status === "approved" && (
                          <Link
                            href={`/admin/affiliates/${a.id}`}
                            className="text-xs tracking-editorial uppercase underline"
                          >
                            Detail
                          </Link>
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
