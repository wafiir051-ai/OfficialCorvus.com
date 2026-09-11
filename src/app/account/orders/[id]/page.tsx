import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getCurrentCustomer } from "@/lib/actions/customer-auth";
import { getMyOrderDetail } from "@/lib/actions/customer-orders";

const STATUS_LABEL: Record<string, string> = {
  pending: "Menunggu Konfirmasi",
  confirmed: "Dikonfirmasi",
  processing: "Diproses",
  shipped: "Dikirim",
  completed: "Selesai",
  cancelled: "Dibatalkan",
};

const STATUS_STEPS = ["pending", "confirmed", "processing", "shipped", "completed"];

export default async function AccountOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const customer = await getCurrentCustomer();
  if (!customer) {
    redirect(`/login?redirect=/account/orders/${id}`);
  }

  const order = await getMyOrderDetail(id);
  if (!order) notFound();

  const isCancelled = order.status === "cancelled";
  const currentStepIndex = STATUS_STEPS.indexOf(order.status);

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
      <Link href="/account" className="text-xs tracking-editorial uppercase text-stone-dark hover:text-ink">
        ← Kembali ke Account
      </Link>

      <div className="mt-6 flex flex-wrap items-start justify-between gap-x-4 gap-y-2 border-t border-ink pt-6">
        <div>
          <p className="text-xs tracking-editorial uppercase text-stone-dark">
            {new Date(order.created_at).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
          <h1 className="mt-1 font-display text-3xl sm:text-4xl">{order.order_number}</h1>
        </div>
      </div>

      {!isCancelled ? (
        <div className="mt-8">
          <div className="relative flex items-center px-1.5">
            <div className="absolute left-1.5 right-1.5 h-px bg-border" />
            <div
              className="absolute left-1.5 h-px bg-ink transition-all"
              style={{
                width:
                  currentStepIndex <= 0
                    ? "0px"
                    : `calc(${
                        (currentStepIndex / (STATUS_STEPS.length - 1)) * 100
                      }% - 12px)`,
              }}
            />
            {STATUS_STEPS.map((step, i) => (
              <div key={step} className="relative z-10 flex-1 text-center">
                <div
                  className={`mx-auto h-2.5 w-2.5 shrink-0 rounded-full ${
                    i <= currentStepIndex ? "bg-ink" : "border border-border bg-off-white"
                  }`}
                />
              </div>
            ))}
          </div>
          <div className="mt-2 grid grid-cols-5 gap-1">
            {STATUS_STEPS.map((step, i) => (
              <p
                key={step}
                className={`text-center text-[9px] leading-tight tracking-editorial uppercase ${
                  i <= currentStepIndex ? "text-ink" : "text-ink-soft"
                }`}
              >
                {STATUS_LABEL[step]}
              </p>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-8 border border-red-600 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-600">Pesanan ini telah dibatalkan.</p>
        </div>
      )}

      {!isCancelled && (order.courier || order.tracking_number) && (
        <div className="mt-8 border border-border bg-off-white-soft px-4 py-5">
          <p className="text-xs tracking-editorial uppercase text-ink-soft">
            Info Pengiriman
          </p>
          {order.courier && <p className="mt-2 text-sm">Kurir: {order.courier}</p>}
          {order.tracking_number && (
            <p className="mt-1 text-sm">No. Resi: {order.tracking_number}</p>
          )}
          {order.shipped_at && (
            <p className="mt-1 text-xs text-ink-soft">
              Dikirim pada{" "}
              {new Date(order.shipped_at).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          )}
        </div>
      )}

      <div className="mt-10">
        <h2 className="border-b border-stone pb-2 text-xs tracking-editorial uppercase text-ink-soft">
          Item Pesanan
        </h2>
        <div className="mt-3 divide-y divide-border border-b border-border">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between py-4">
              <div>
                <p className="text-sm">{item.product_name_snapshot}</p>
                <p className="mt-1 text-xs text-ink-soft">
                  {item.size_snapshot} / {item.color_snapshot} &middot; x{item.quantity}
                </p>
              </div>
              <p className="text-sm text-ink-soft">
                Rp{(item.unit_price * item.quantity).toLocaleString("id-ID")}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-right text-sm font-medium">
          Total: Rp{order.subtotal.toLocaleString("id-ID")}
        </p>
      </div>

      {order.notes && (
        <div className="mt-8">
          <h2 className="border-b border-stone pb-2 text-xs tracking-editorial uppercase text-ink-soft">
            Catatan
          </h2>
          <p className="mt-3 text-sm text-ink-soft">{order.notes}</p>
        </div>
      )}
    </div>
  );
}
