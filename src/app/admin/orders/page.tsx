import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";

const STATUS_LABEL: Record<string, string> = {
  pending: "Menunggu Konfirmasi",
  confirmed: "Dikonfirmasi",
  processing: "Diproses",
  shipped: "Dikirim",
  completed: "Selesai",
  cancelled: "Dibatalkan",
};

const STATUS_STYLE: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-blue-100 text-blue-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-indigo-100 text-indigo-800",
  completed: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-red-100 text-red-800",
};

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status: statusFilter } = await searchParams;

  const supabaseAdmin = createAdminClient();

  let query = supabaseAdmin
    .from("orders")
    .select(
      "id, order_number, status, subtotal, created_at, tracking_number, customers(full_name, phone)"
    )
    .order("created_at", { ascending: false });

  if (statusFilter) {
    query = query.eq("status", statusFilter as never);
  }

  const { data: orders, error } = await query;

  if (error) {
    return <p className="text-sm text-red-600">Gagal memuat orders: {error.message}</p>;
  }

  const statuses = Object.keys(STATUS_LABEL);

  return (
    <div>
      <h1 className="font-display text-3xl tracking-editorial">Orders</h1>

      <div className="mt-6 flex flex-wrap gap-2 border-b border-border pb-6">
        <Link
          href="/admin/orders"
          className={`border px-3 py-1.5 text-xs tracking-editorial uppercase transition-colors ${
            !statusFilter
              ? "border-ink bg-ink text-off-white"
              : "border-border text-ink-soft hover:border-ink"
          }`}
        >
          Semua
        </Link>
        {statuses.map((s) => (
          <Link
            key={s}
            href={`/admin/orders?status=${s}`}
            className={`border px-3 py-1.5 text-xs tracking-editorial uppercase transition-colors ${
              statusFilter === s
                ? "border-ink bg-ink text-off-white"
                : "border-border text-ink-soft hover:border-ink"
            }`}
          >
            {STATUS_LABEL[s]}
          </Link>
        ))}
      </div>

      {!orders || orders.length === 0 ? (
        <p className="mt-6 text-sm text-stone-dark">Belum ada order.</p>
      ) : (
        <div className="mt-6 overflow-x-auto border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-off-white-soft text-left text-xs tracking-editorial uppercase text-ink-soft">
                <th className="py-3 pl-4 pr-4">Order</th>
                <th className="py-3 pr-4">Customer</th>
                <th className="py-3 pr-4">No. WhatsApp</th>
                <th className="py-3 pr-4">Tanggal</th>
                <th className="py-3 pr-4">Subtotal</th>
                <th className="py-3 pr-4">Status</th>
                <th className="py-3 pr-4">No. Resi</th>
                <th className="py-3 pr-4"></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => {
                const customer = Array.isArray(o.customers) ? o.customers[0] : o.customers;
                return (
                  <tr key={o.id} className="border-b border-border last:border-0 hover:bg-off-white-soft">
                    <td className="py-3 pl-4 pr-4 font-medium">{o.order_number}</td>
                    <td className="py-3 pr-4 text-ink-soft">
                      {customer?.full_name ?? "-"}
                    </td>
                    <td className="py-3 pr-4 text-ink-soft">
                      {customer?.phone ?? "-"}
                    </td>
                    <td className="py-3 pr-4 text-ink-soft">
                      {new Date(o.created_at).toLocaleDateString("id-ID")}
                    </td>
                    <td className="py-3 pr-4 text-ink-soft">
                      Rp{o.subtotal.toLocaleString("id-ID")}
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className={cn(
                          "inline-block rounded-full px-2.5 py-1 text-xs font-medium",
                          STATUS_STYLE[o.status] ?? "bg-stone/20 text-ink-soft"
                        )}
                      >
                        {STATUS_LABEL[o.status] ?? o.status}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-ink-soft">{o.tracking_number ?? "-"}</td>
                    <td className="py-3 pr-4 text-right">
                      <Link
                        href={`/admin/orders/${o.id}`}
                        className="text-xs uppercase underline"
                      >
                        Detail
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
