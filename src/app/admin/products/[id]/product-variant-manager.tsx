import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";

type VariantRow = {
  id: string;
  size: string;
  color: string;
  sku: string;
  price_override: number | null;
  inventory: { quantity: number; low_stock_threshold: number } | { quantity: number; low_stock_threshold: number }[] | null;
};

async function addVariant(productId: string, formData: FormData) {
  "use server";

  const size = String(formData.get("size") || "").trim();
  const color = String(formData.get("color") || "").trim();
  const sku = String(formData.get("sku") || "").trim();
  const quantityRaw = String(formData.get("quantity") || "0");
  const quantity = Number(quantityRaw);

  if (!size || !color || !sku || Number.isNaN(quantity) || quantity < 0) {
    redirect(`/admin/products/${productId}?variantError=invalid`);
  }

  const supabaseAdmin = createAdminClient();

  const { data: variant, error: variantError } = await supabaseAdmin
    .from("product_variants")
    .insert({ product_id: productId, size, color, sku })
    .select("id")
    .single();

  if (variantError || !variant) {
    const message = variantError?.code === "23505" ? "duplicate_sku" : "insert_failed";
    redirect(`/admin/products/${productId}?variantError=${message}`);
  }

  const { error: inventoryError } = await supabaseAdmin
    .from("inventory")
    .insert({ variant_id: variant.id, quantity });

  if (inventoryError) {
    await supabaseAdmin.from("product_variants").delete().eq("id", variant.id);
    redirect(`/admin/products/${productId}?variantError=insert_failed`);
  }

  redirect(`/admin/products/${productId}?variantAdded=1`);
}

async function deleteVariant(productId: string, variantId: string) {
  "use server";

  const supabaseAdmin = createAdminClient();

  await supabaseAdmin.from("inventory").delete().eq("variant_id", variantId);
  await supabaseAdmin.from("product_variants").delete().eq("id", variantId);

  redirect(`/admin/products/${productId}?variantRemoved=1`);
}

export default async function ProductVariantManager({ productId }: { productId: string }) {
  const supabaseAdmin = createAdminClient();

  const { data: variants } = await supabaseAdmin
    .from("product_variants")
    .select("id, size, color, sku, price_override, inventory ( quantity, low_stock_threshold )")
    .eq("product_id", productId)
    .order("created_at", { ascending: true });

  const boundAddVariant = addVariant.bind(null, productId);

  return (
    <div>
      {(variants?.length ?? 0) > 0 && (
        <div className="border-y border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs tracking-editorial uppercase text-ink-soft">
                <th className="py-3 pr-4">Size</th>
                <th className="py-3 pr-4">Color</th>
                <th className="py-3 pr-4">SKU</th>
                <th className="py-3 pr-4">Stock</th>
                <th className="py-3"></th>
              </tr>
            </thead>
            <tbody>
              {(variants as unknown as VariantRow[]).map((v) => {
                const inv = Array.isArray(v.inventory) ? v.inventory[0] : v.inventory;
                const boundDelete = deleteVariant.bind(null, productId, v.id);
                return (
                  <tr key={v.id} className="border-b border-border last:border-0">
                    <td className="py-3 pr-4">{v.size}</td>
                    <td className="py-3 pr-4">{v.color}</td>
                    <td className="py-3 pr-4 text-ink-soft">{v.sku}</td>
                    <td className="py-3 pr-4 text-ink-soft">{inv?.quantity ?? 0}</td>
                    <td className="py-3 text-right">
                      <form action={boundDelete}>
                        <button
                          type="submit"
                          className="text-xs uppercase text-red-600 underline"
                        >
                          Remove
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

      {(variants?.length ?? 0) === 0 && (
        <p className="mt-3 text-sm text-stone-dark">Belum ada variant. Tambahkan minimal satu di bawah.</p>
      )}

      <form action={boundAddVariant} className="mt-6 flex flex-wrap items-end gap-3">
        <div>
          <label className="text-xs tracking-editorial uppercase text-ink-soft">Size</label>
          <input
            name="size"
            type="text"
            required
            placeholder="e.g. M"
            className="mt-1 w-24 border border-border bg-off-white px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-xs tracking-editorial uppercase text-ink-soft">Color</label>
          <input
            name="color"
            type="text"
            required
            placeholder="e.g. Black"
            className="mt-1 w-32 border border-border bg-off-white px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-xs tracking-editorial uppercase text-ink-soft">SKU</label>
          <input
            name="sku"
            type="text"
            required
            placeholder="e.g. KML-M-BLK"
            className="mt-1 w-40 border border-border bg-off-white px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-xs tracking-editorial uppercase text-ink-soft">Stock</label>
          <input
            name="quantity"
            type="number"
            min="0"
            step="1"
            defaultValue="0"
            required
            className="mt-1 w-24 border border-border bg-off-white px-3 py-2 text-sm"
          />
        </div>
        <button
          type="submit"
          className="border border-ink px-4 py-2 text-xs tracking-editorial uppercase hover:bg-ink hover:text-off-white transition-colors"
        >
          Add Variant
        </button>
      </form>
    </div>
  );
}
