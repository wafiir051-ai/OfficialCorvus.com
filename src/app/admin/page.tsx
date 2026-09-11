import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function AdminDashboardPage() {
  const supabaseAdmin = createAdminClient();

  const [{ count: productCount }, { count: orderCount }, { count: customerCount }] =
    await Promise.all([
      supabaseAdmin.from("products").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("orders").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("customers").select("*", { count: "exact", head: true }),
    ]);

  const { data: recentOrders } = await supabaseAdmin
    .from("orders")
    .select("id, order_number, status, subtotal, created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  const STATS = [
    { label: "Total Products", value: productCount ?? 0 },
    { label: "Total Orders", value: orderCount ?? 0 },
    { label: "Total Customers", value: customerCount ?? 0 },
  ];

  return (
    <div>
      <h1 className="font-display text-3xl tracking-editorial border-b border-border pb-6">Dashboard</h1>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {STATS.map((stat) => (
          <div key={stat.label} className="border border-border bg-off-white-soft p-5">
            <p className="text-xs tracking-editorial uppercase text-ink-soft">
              {stat.label}
            </p>
            <p className="mt-2 font-display text-4xl">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-10">
        <h2 className="border-b border-stone pb-2 text-xs tracking-editorial uppercase text-ink-soft">
          Recent Orders
        </h2>

        {recentOrders && recentOrders.length > 0 ? (
          <div className="mt-4 divide-y divide-border border-b border-border">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between py-3 text-sm hover:bg-off-white-soft">
                <span className="font-medium">{order.order_number}</span>
                <span className="text-ink-soft capitalize">{order.status}</span>
                <span>Rp{order.subtotal.toLocaleString("id-ID")}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-stone-dark">No orders yet.</p>
        )}
      </div>
    </div>
  );
}
