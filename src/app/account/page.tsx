import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentCustomer, signOutCustomer } from "@/lib/actions/customer-auth";
import { getMyOrders } from "@/lib/actions/customer-orders";

const STATUS_LABEL: Record<string, string> = {
  pending: "Menunggu Konfirmasi",
  confirmed: "Dikonfirmasi",
  processing: "Diproses",
  shipped: "Dikirim",
  completed: "Selesai",
  cancelled: "Dibatalkan",
};

async function handleSignOut() {
  "use server";
  await signOutCustomer();
  redirect("/");
}

export default async function AccountPage() {
  const customer = await getCurrentCustomer();

  if (!customer) {
    redirect("/login?redirect=/account");
  }

  const orders = await getMyOrders();

  return (
    <div className="mx-auto max-w-lg px-4 py-16 sm:px-6 lg:px-8">
      <p className="text-xs tracking-editorial uppercase text-stone-dark">Account</p>
      <h1 className="mt-2 font-display text-5xl leading-[0.95] sm:text-6xl">
        {customer.full_name || "Akun Saya"}
      </h1>

      <div className="mt-10 border-t border-ink pt-8">
        <h2 className="border-b border-stone pb-2 text-xs tracking-editorial uppercase text-ink-soft">
          Informasi Akun
        </h2>
        <div className="mt-4 space-y-4">
          <div>
            <p className="text-xs tracking-editorial uppercase text-ink-soft">Email</p>
            <p className="mt-1 text-sm">{customer.email ?? "-"}</p>
          </div>
          <div>
            <p className="text-xs tracking-editorial uppercase text-ink-soft">Nomor HP</p>
            <p className="mt-1 text-sm">{customer.phone ?? "-"}</p>
          </div>
        </div>
      </div>

      <div className="mt-10">
        <h2 className="border-b border-stone pb-2 text-xs tracking-editorial uppercase text-ink-soft">
          Riwayat Pesanan
        </h2>

        {orders.length === 0 ? (
          <p className="mt-4 text-sm text-stone-dark">Belum ada pesanan.</p>
        ) : (
          <div className="mt-4 divide-y divide-border border-b border-border">
            {orders.map((o) => (
              <Link
                key={o.id}
                href={`/account/orders/${o.id}`}
                className="flex items-center justify-between py-4 hover:bg-off-white-soft"
              >
                <div>
                  <p className="text-sm font-medium">{o.order_number}</p>
                  <p className="mt-1 text-xs text-ink-soft">
                    {new Date(o.created_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm">Rp{o.subtotal.toLocaleString("id-ID")}</p>
                  <p className="mt-1 text-xs text-ink-soft">
                    {STATUS_LABEL[o.status] ?? o.status}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <form action={handleSignOut} className="mt-10">
        <button
          type="submit"
          className="border border-ink px-4 py-2 text-xs tracking-editorial uppercase hover:bg-ink hover:text-off-white transition-colors"
        >
          Keluar
        </button>
      </form>
    </div>
  );
}
