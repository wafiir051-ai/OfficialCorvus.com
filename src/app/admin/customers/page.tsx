import { createAdminClient } from "@/lib/supabase/admin";

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  const supabaseAdmin = createAdminClient();

  let query = supabaseAdmin
    .from("customers")
    .select("id, full_name, phone, email, created_at")
    .order("created_at", { ascending: false });

  if (q) {
    query = query.or(`full_name.ilike.%${q}%,phone.ilike.%${q}%,email.ilike.%${q}%`);
  }

  const { data: customers, error } = await query;

  if (error) {
    return <p className="text-sm text-red-600">Gagal memuat customers: {error.message}</p>;
  }

  const customerIds = (customers ?? []).map((c) => c.id);

  const orderCountByCustomer = new Map<string, { count: number; total: number }>();

  if (customerIds.length > 0) {
    const { data: orders } = await supabaseAdmin
      .from("orders")
      .select("customer_id, subtotal")
      .in("customer_id", customerIds);

    for (const order of orders ?? []) {
      const current = orderCountByCustomer.get(order.customer_id) ?? { count: 0, total: 0 };
      current.count += 1;
      current.total += order.subtotal;
      orderCountByCustomer.set(order.customer_id, current);
    }
  }

  return (
    <div>
      <h1 className="font-display text-3xl tracking-editorial border-b border-border pb-6">Customers</h1>

      <form className="mt-6" method="get">
        <input
          name="q"
          type="text"
          defaultValue={q ?? ""}
          placeholder="Cari nama, telepon, atau email..."
          className="w-full max-w-sm border border-border bg-off-white px-3 py-2 text-sm sm:w-80"
        />
      </form>

      {!customers || customers.length === 0 ? (
        <p className="mt-6 text-sm text-stone-dark">Tidak ada customer ditemukan.</p>
      ) : (
        <div className="mt-6 overflow-x-auto border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-off-white-soft text-left text-xs tracking-editorial uppercase text-ink-soft">
                <th className="py-3 pl-4 pr-4">Nama</th>
                <th className="py-3 pr-4">Telepon</th>
                <th className="py-3 pr-4">Email</th>
                <th className="py-3 pr-4">Order</th>
                <th className="py-3 pr-4">Total Belanja</th>
                <th className="py-3 pr-4">Bergabung</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => {
                const stats = orderCountByCustomer.get(c.id);
                return (
                  <tr key={c.id} className="border-b border-border last:border-0 hover:bg-off-white-soft">
                    <td className="py-3 pl-4 pr-4 font-medium">{c.full_name}</td>
                    <td className="py-3 pr-4 text-ink-soft">{c.phone}</td>
                    <td className="py-3 pr-4 text-ink-soft">{c.email ?? "-"}</td>
                    <td className="py-3 pr-4 text-ink-soft">{stats?.count ?? 0}</td>
                    <td className="py-3 pr-4 text-ink-soft">
                      Rp{(stats?.total ?? 0).toLocaleString("id-ID")}
                    </td>
                    <td className="py-3 pr-4 text-ink-soft">
                      {new Date(c.created_at).toLocaleDateString("id-ID")}
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
