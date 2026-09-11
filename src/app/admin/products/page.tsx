import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";
import Image from "next/image";
import { Pencil, Trash2, Search } from "lucide-react";
import { deleteProductAction } from "@/lib/actions/products";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const supabaseAdmin = createAdminClient();

  const { data: products, error } = await supabaseAdmin
    .from("products")
    .select(
      `
      id,
      name,
      price,
      status,
      product_images ( storage_path, sort_order ),
      categories ( name ),
      product_variants ( inventory ( quantity ) )
    `
    )
    .order("created_at", { ascending: false });

  if (error) {
    return <p className="text-sm text-red-600">Gagal memuat produk: {error.message}</p>;
  }

  const getCoverImageUrl = (images: { storage_path: string; sort_order: number }[] | null) => {
    if (!images || images.length === 0) return null;
    const sorted = [...images].sort((a, b) => a.sort_order - b.sort_order);
    const { data } = supabaseAdmin.storage
      .from("product-images")
      .getPublicUrl(sorted[0].storage_path);
    return data.publicUrl;
  };

  const getTotalStock = (variants: unknown) => {
    const list = (variants ?? []) as { inventory: { quantity: number } | { quantity: number }[] | null }[];
    return list.reduce((sum, v) => {
      const inv = Array.isArray(v.inventory) ? v.inventory[0] : v.inventory;
      return sum + (inv?.quantity ?? 0);
    }, 0);
  };

  const filteredProducts = q
    ? (products ?? []).filter((p) => p.name.toLowerCase().includes(q.toLowerCase()))
    : (products ?? []);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-6">
        <h1 className="font-display text-3xl tracking-editorial">Products</h1>
        <Link
          href="/admin/products/new"
          className="border border-ink px-4 py-2 text-xs tracking-editorial uppercase hover:bg-ink hover:text-off-white transition-colors"
        >
          + Add Product
        </Link>
      </div>

      <form method="get" className="mt-6 relative max-w-sm">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-dark"
          strokeWidth={1.5}
        />
        <input
          type="text"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Cari produk..."
          className="w-full border border-border bg-off-white py-2 pl-9 pr-3 text-sm placeholder:text-stone-dark focus:border-ink focus:outline-none"
        />
      </form>

      <div className="mt-6 overflow-x-auto border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-off-white-soft text-left text-xs tracking-editorial uppercase text-ink-soft">
              <th className="py-3 pl-4 pr-4">Image</th>
              <th className="py-3 pr-4">Name</th>
              <th className="py-3 pr-4">Category</th>
              <th className="py-3 pr-4">Price</th>
              <th className="py-3 pr-4">Stock</th>
              <th className="py-3 pr-4">Status</th>
              <th className="py-3 pr-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => {
              const coverUrl = getCoverImageUrl(product.product_images as any);
              const categoryName = (product.categories as unknown as { name: string } | null)?.name ?? "—";
              const stock = getTotalStock(product.product_variants);
              return (
                <tr key={product.id} className="border-b border-border last:border-0 hover:bg-off-white-soft">
                  <td className="py-3 pl-4 pr-4">
                    <div className="relative h-12 w-12 overflow-hidden border border-border bg-stone/10">
                      {coverUrl ? (
                        <Image src={coverUrl} alt={product.name} fill className="object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[10px] text-stone-dark">
                          No image
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-3 pr-4 font-medium">{product.name}</td>
                  <td className="py-3 pr-4 text-ink-soft">{categoryName}</td>
                  <td className="py-3 pr-4 text-ink-soft">
                    Rp{Number(product.price).toLocaleString("id-ID")}
                  </td>
                  <td className="py-3 pr-4 text-ink-soft">{stock}</td>
                  <td className="py-3 pr-4 text-ink-soft capitalize">{product.status}</td>
                  <td className="py-3 pr-4">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/admin/products/${product.id}`}
                        aria-label={`Edit ${product.name}`}
                        className="text-ink-soft hover:text-ink transition-colors"
                      >
                        <Pencil className="h-4 w-4" strokeWidth={1.5} />
                      </Link>
                      <form action={deleteProductAction.bind(null, product.id)}>
                        <button
                          type="submit"
                          aria-label={`Delete ${product.name}`}
                          className="text-ink-soft hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredProducts.length === 0 && (
          <p className="py-8 text-center text-sm text-stone-dark">
            {q ? `Tidak ada produk yang cocok dengan "${q}".` : "Belum ada produk."}
          </p>
        )}
      </div>
    </div>
  );
}
