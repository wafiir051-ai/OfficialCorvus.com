import { createAdminClient } from "@/lib/supabase/admin";

async function updateStock(inventoryId: string, formData: FormData) {
  "use server";

  const quantity = Number(formData.get("quantity"));

  if (Number.isNaN(quantity) || quantity < 0) {
    return;
  }

  const supabaseAdmin = createAdminClient();

  await supabaseAdmin
    .from("inventory")
    .update({ quantity, updated_at: new Date().toISOString() })
    .eq("id", inventoryId);
}

export default async function AdminInventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter } = await searchParams;

  const supabaseAdmin = createAdminClient();

  const { data: inventoryRows, error } = await supabaseAdmin
    .from("inventory")
    .select(
      "id, quantity, low_stock_threshold, updated_at, product_variants(id, size, color, sku, products(name))"
    )
    .order("updated_at", { ascending: false });

  if (error) {
    return <p className="text-sm text-red-600">Gagal memuat inventory: {error.message}</p>;
  }

  type Row = {
    id: string;
    quantity: number;
    low_stock_threshold: number;
    updated_at: string;
    product_variants:
      | {
          id: string;
          size: string;
          color: string;
          sku: string;
          products: { name: string } | { name: string }[] | null;
        }
      | {
          id: string;
          size: string;
          color: string;
          sku: string;
          products: { name: string } | { name: string }[] | null;
        }[]
      | null;
  };

  const rows = (inventoryRows ?? []) as Row[];

  const normalized = rows.map((row) => {
    const variant = Array.isArray(row.product_variants)
      ? row.product_variants[0]
      : row.product_variants;
    const product = variant
      ? Array.isArray(variant.products)
        ? variant.products[0]
        : variant.products
      : null;

    return {
      id: row.id,
      quantity: row.quantity,
      lowStockThreshold: row.low_stock_threshold,
      updatedAt: row.updated_at,
      productName: product?.name ?? "-",
      size: variant?.size ?? "-",
      color: variant?.color ?? "-",
      sku: variant?.sku ?? "-",
    };
  });

  const filtered =
    filter === "low"
      ? normalized.filter((r) => r.quantity <= r.lowStockThreshold)
      : normalized;

  const lowStockCount = normalized.filter((r) => r.quantity <= r.lowStockThreshold).length;

  return (
    <div>
      <h1 className="font-display text-3xl tracking-editorial border-b border-border pb-6">Inventory</h1>

      <div className="mt-6 flex flex-wrap gap-2">
        <a
          href="/admin/inventory"
          className={`border px-3 py-1.5 text-xs tracking-editorial uppercase transition-colors ${
            !filter
              ? "border-ink bg-ink text-off-white"
              : "border-border text-ink-soft hover:border-ink"
          }`}
        >
          Semua
        </a>
        <a
          href="/admin/inventory?filter=low"
          className={`border px-3 py-1.5 text-xs tracking-editorial uppercase transition-colors ${
            filter === "low"
              ? "border-red-600 bg-red-600 text-off-white"
              : "border-border text-ink-soft hover:border-red-600"
          }`}
        >
          Stok Menipis ({lowStockCount})
        </a>
      </div>

      {filtered.length === 0 ? (
        <p className="mt-6 text-sm text-stone-dark">Tidak ada data inventory.</p>
      ) : (
        <div className="mt-6 overflow-x-auto border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-off-white-soft text-left text-xs tracking-editorial uppercase text-ink-soft">
                <th className="py-3 pl-4 pr-4">Produk</th>
                <th className="py-3 pr-4">Varian</th>
                <th className="py-3 pr-4">SKU</th>
                <th className="py-3 pr-4">Stok</th>
                <th className="py-3 pr-4">Update</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => {
                const isLow = row.quantity <= row.lowStockThreshold;
                const boundUpdate = updateStock.bind(null, row.id);
                return (
                  <tr key={row.id} className="border-b border-border last:border-0 hover:bg-off-white-soft">
                    <td className="py-3 pl-4 pr-4 font-medium">{row.productName}</td>
                    <td className="py-3 pr-4 text-ink-soft">
                      {row.size} / {row.color}
                    </td>
                    <td className="py-3 pr-4 text-ink-soft">{row.sku}</td>
                    <td className="py-3 pr-4">
                      <span className={isLow ? "font-medium text-red-600" : "text-ink-soft"}>
                        {row.quantity}
                      </span>
                      {isLow && (
                        <span className="ml-2 text-[10px] uppercase tracking-editorial text-red-600">
                          Menipis
                        </span>
                      )}
                    </td>
                    <td className="py-3 pr-4">
                      <form action={boundUpdate} className="flex items-center gap-2">
                        <input
                          name="quantity"
                          type="number"
                          min="0"
                          defaultValue={row.quantity}
                          className="w-20 border border-border bg-off-white px-2 py-1 text-sm"
                        />
                        <button
                          type="submit"
                          className="border border-ink px-3 py-1 text-xs tracking-editorial uppercase hover:bg-ink hover:text-off-white transition-colors"
                        >
                          Simpan
                        </button>
                      </form>
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
