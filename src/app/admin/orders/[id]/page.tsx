import { createAdminClient } from "@/lib/supabase/admin";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";

const STATUS_LABEL: Record<string, string> = {
  pending: "Menunggu Konfirmasi",
  confirmed: "Dikonfirmasi",
  processing: "Diproses",
  shipped: "Dikirim",
  completed: "Selesai",
  cancelled: "Dibatalkan",
};

const STATUS_OPTIONS = Object.keys(STATUS_LABEL);

async function updateOrderStatus(orderId: string, formData: FormData) {
  "use server";

  const status = String(formData.get("status") || "");
  const courier = String(formData.get("courier") || "").trim();
  const trackingNumber = String(formData.get("tracking_number") || "").trim();

  if (!STATUS_OPTIONS.includes(status)) {
    redirect(`/admin/orders/${orderId}?error=invalid_status`);
  }

  const supabaseAdmin = createAdminClient();

  const update: {
    status: string;
    courier: string | null;
    tracking_number: string | null;
    shipped_at?: string;
  } = {
    status,
    courier: courier || null,
    tracking_number: trackingNumber || null,
  };

  if (status === "shipped") {
    update.shipped_at = new Date().toISOString();
  }

  const { error } = await supabaseAdmin
    .from("orders")
    .update(update as never)
    .eq("id", orderId);

  if (error) {
    redirect(`/admin/orders/${orderId}?error=update_failed`);
  }

  redirect(`/admin/orders/${orderId}?saved=1`);
}

export default async function AdminOrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const { id } = await params;
  const { error, saved } = await searchParams;

  const supabaseAdmin = createAdminClient();

  const { data: order } = await supabaseAdmin
    .from("orders")
    .select(
      "id, order_number, status, subtotal, notes, created_at, courier, tracking_number, shipped_at, customers(full_name, phone), customer_addresses(recipient_name, phone, full_address, city, province, postal_code)"
    )
    .eq("id", id)
    .single();

  if (!order) notFound();

  const { data: items } = await supabaseAdmin
    .from("order_items")
    .select("id, product_name_snapshot, size_snapshot, color_snapshot, unit_price, quantity")
    .eq("order_id", id);

  const customer = Array.isArray(order.customers) ? order.customers[0] : order.customers;
  const address = Array.isArray(order.customer_addresses)
    ? order.customer_addresses[0]
    : order.customer_addresses;

  const boundUpdateStatus = updateOrderStatus.bind(null, order.id);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-6">
        <div>
          <p className="text-xs tracking-editorial uppercase text-ink-soft">
            {new Date(order.created_at).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
          <h1 className="mt-1 font-display text-3xl tracking-editorial">
            {order.order_number}
          </h1>
        </div>
        <Link href="/admin/orders" className="text-xs tracking-editorial uppercase underline">
          Back to Orders
        </Link>
      </div>

      {saved && (
        <p className="mt-4 border border-green-700 bg-green-50 px-4 py-2 text-sm text-green-700">
          Status pesanan disimpan.
        </p>
      )}
      {error && (
        <p className="mt-4 border border-red-600 bg-red-50 px-4 py-2 text-sm text-red-600">
          Terjadi kesalahan, coba lagi.
        </p>
      )}

      <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2">
        <div>
          <h2 className="border-b border-stone pb-2 text-xs tracking-editorial uppercase text-ink-soft">
            Customer
          </h2>
          <p className="mt-2 text-sm">{customer?.full_name ?? "-"}</p>
          <p className="text-sm text-ink-soft">{customer?.phone ?? "-"}</p>
        </div>

        <div>
          <h2 className="border-b border-stone pb-2 text-xs tracking-editorial uppercase text-ink-soft">
            Alamat Pengiriman
          </h2>
          {address ? (
            <div className="mt-2 text-sm text-ink-soft">
              <p className="text-ink">{address.recipient_name}</p>
              <p>{address.phone}</p>
              <p>{address.full_address}</p>
              <p>
                {address.city}, {address.province} {address.postal_code}
              </p>
            </div>
          ) : (
            <p className="mt-2 text-sm text-stone-dark">Tidak ada alamat.</p>
          )}
        </div>
      </div>

      <div className="mt-10">
        <h2 className="border-b border-stone pb-2 text-xs tracking-editorial uppercase text-ink-soft">
          Item Pesanan
        </h2>
        <div className="mt-3 overflow-x-auto border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-off-white-soft text-left text-xs tracking-editorial uppercase text-ink-soft">
                <th className="py-3 pl-4 pr-4">Produk</th>
                <th className="py-3 pr-4">Varian</th>
                <th className="py-3 pr-4">Harga</th>
                <th className="py-3 pr-4">Qty</th>
                <th className="py-3 pr-4">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {(items ?? []).map((item) => (
                <tr key={item.id} className="border-b border-border last:border-0">
                  <td className="py-3 pl-4 pr-4">{item.product_name_snapshot}</td>
                  <td className="py-3 pr-4 text-ink-soft">
                    {item.size_snapshot} / {item.color_snapshot}
                  </td>
                  <td className="py-3 pr-4 text-ink-soft">
                    Rp{item.unit_price.toLocaleString("id-ID")}
                  </td>
                  <td className="py-3 pr-4 text-ink-soft">{item.quantity}</td>
                  <td className="py-3 pr-4 text-ink-soft">
                    Rp{(item.unit_price * item.quantity).toLocaleString("id-ID")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-right text-sm font-medium">
          Total: Rp{order.subtotal.toLocaleString("id-ID")}
        </p>
      </div>

      {order.notes && (
        <div className="mt-8">
          <h2 className="border-b border-stone pb-2 text-xs tracking-editorial uppercase text-ink-soft">
            Catatan Customer
          </h2>
          <p className="mt-2 text-sm text-ink-soft">{order.notes}</p>
        </div>
      )}

      <div className="mt-10 border border-border bg-off-white-soft p-6">
        <h2 className="text-xs tracking-editorial uppercase text-ink-soft">
          Update Status Pengiriman
        </h2>
        <form action={boundUpdateStatus} className="mt-4 flex flex-wrap items-end gap-3">
          <div>
            <label className="text-xs tracking-editorial uppercase text-ink-soft">Status</label>
            <select
              name="status"
              defaultValue={order.status}
              className="mt-1 w-48 border border-border bg-off-white px-3 py-2 text-sm"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABEL[s]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs tracking-editorial uppercase text-ink-soft">Kurir</label>
            <input
              name="courier"
              type="text"
              defaultValue={order.courier ?? ""}
              placeholder="JNE / J&T / SiCepat"
              className="mt-1 w-40 border border-border bg-off-white px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs tracking-editorial uppercase text-ink-soft">
              Nomor Resi
            </label>
            <input
              name="tracking_number"
              type="text"
              defaultValue={order.tracking_number ?? ""}
              placeholder="JX1234567890"
              className="mt-1 w-48 border border-border bg-off-white px-3 py-2 text-sm"
            />
          </div>
          <button
            type="submit"
            className="border border-ink bg-ink px-4 py-2 text-xs tracking-editorial uppercase text-off-white hover:bg-ink-soft transition-colors"
          >
            Simpan
          </button>
        </form>
        {order.shipped_at && (
          <p className="mt-3 text-xs text-ink-soft">
            Dikirim pada{" "}
            {new Date(order.shipped_at).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        )}
      </div>
    </div>
  );
}
