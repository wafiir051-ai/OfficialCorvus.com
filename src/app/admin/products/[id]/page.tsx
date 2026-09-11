import { createAdminClient } from "@/lib/supabase/admin";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import ProductImageManager from "./product-image-manager";
import ProductVariantManager from "./product-variant-manager";

async function updateProduct(productId: string, formData: FormData) {
  "use server";

  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const priceRaw = String(formData.get("price") || "");
  const categoryId = String(formData.get("category_id") || "").trim();
  const status = String(formData.get("status") || "draft");
  const isFeatured = formData.get("is_featured") === "on";

  const price = Number(priceRaw);

  if (!name || !description || !priceRaw || Number.isNaN(price) || price < 0) {
    redirect(`/admin/products/${productId}?error=invalid`);
  }

  const validStatuses = ["draft", "published", "archived"];
  const finalStatus = validStatuses.includes(status) ? status : "draft";

  const supabaseAdmin = createAdminClient();

  const { error } = await supabaseAdmin
    .from("products")
    .update({
      name,
      description,
      price,
      category_id: categoryId || null,
      status: finalStatus as "draft" | "published" | "archived",
      is_featured: isFeatured,
      updated_at: new Date().toISOString(),
    })
    .eq("id", productId);

  if (error) {
    redirect(`/admin/products/${productId}?error=update_failed`);
  }

  redirect(`/admin/products/${productId}?saved=1`);
}

import { deleteProductAction } from "@/lib/actions/products";

export default async function AdminProductDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    error?: string;
    saved?: string;
    variantError?: string;
    variantAdded?: string;
    variantRemoved?: string;
  }>;
}) {
  const { id } = await params;
  const { error, saved, variantError, variantAdded, variantRemoved } = await searchParams;
  const supabaseAdmin = createAdminClient();

  const { data: product } = await supabaseAdmin
    .from("products")
    .select("id, name, price, status, description, category_id, is_featured")
    .eq("id", id)
    .single();

  if (!product) notFound();

  const { data: categories } = await supabaseAdmin
    .from("categories")
    .select("id, name")
    .order("name", { ascending: true });

  const { data: images } = await supabaseAdmin
    .from("product_images")
    .select("id, storage_path, alt_text, sort_order")
    .eq("product_id", id)
    .order("sort_order", { ascending: true });

  const imagesWithUrls = (images ?? []).map((img) => {
    const { data } = supabaseAdmin.storage
      .from("product-images")
      .getPublicUrl(img.storage_path);
    return { ...img, publicUrl: data.publicUrl };
  });

  const boundUpdate = updateProduct.bind(null, product.id);
  const boundDelete = deleteProductAction.bind(null, product.id);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-6">
        <div>
          <h1 className="font-display text-3xl tracking-editorial">{product.name}</h1>
          <p className="mt-1 text-xs tracking-editorial uppercase text-ink-soft">
            {product.status}
          </p>
        </div>
        <Link href="/admin/products" className="text-xs tracking-editorial uppercase underline">
          Back to Products
        </Link>
      </div>

      {saved && (
        <p className="mt-4 border border-green-700 bg-green-50 px-4 py-2 text-sm text-green-700">
          Perubahan disimpan.
        </p>
      )}
      {error && (
        <p className="mt-4 border border-red-600 bg-red-50 px-4 py-2 text-sm text-red-600">
          {error === "invalid"
            ? "Nama, deskripsi, dan harga wajib diisi dengan benar."
            : "Gagal menyimpan perubahan. Coba lagi."}
        </p>
      )}

      <div className="mt-8">
        <h2 className="border-b border-stone pb-2 text-xs tracking-editorial uppercase text-ink-soft">
          Product Images
        </h2>
        <div className="mt-4">
          <ProductImageManager productId={product.id} initialImages={imagesWithUrls} />
        </div>
      </div>

      <div className="mt-10">
        <h2 className="border-b border-stone pb-2 text-xs tracking-editorial uppercase text-ink-soft">
          Variants
        </h2>

        {variantAdded && (
          <p className="mt-3 border border-green-700 bg-green-50 px-4 py-2 text-sm text-green-700">
            Variant ditambahkan.
          </p>
        )}
        {variantRemoved && (
          <p className="mt-3 border border-green-700 bg-green-50 px-4 py-2 text-sm text-green-700">
            Variant dihapus.
          </p>
        )}
        {variantError && (
          <p className="mt-3 border border-red-600 bg-red-50 px-4 py-2 text-sm text-red-600">
            {variantError === "invalid"
              ? "Size, color, SKU, dan stok wajib diisi dengan benar."
              : variantError === "duplicate_sku"
                ? "SKU sudah dipakai variant lain."
                : "Gagal menyimpan variant. Coba lagi."}
          </p>
        )}

        <div className="mt-4">
          <ProductVariantManager productId={product.id} />
        </div>
      </div>

      <div className="mt-10 border border-border bg-off-white-soft p-6">
        <h2 className="text-xs tracking-editorial uppercase text-ink-soft">Edit Product</h2>

        <form action={boundUpdate} className="mt-4 max-w-lg space-y-6">
          <div>
            <label htmlFor="name" className="text-xs tracking-editorial uppercase text-ink-soft">
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              defaultValue={product.name}
              required
              className="mt-1 w-full border border-border bg-off-white px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label htmlFor="description" className="text-xs tracking-editorial uppercase text-ink-soft">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              defaultValue={product.description ?? ""}
              required
              rows={4}
              className="mt-1 w-full border border-border bg-off-white px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label htmlFor="price" className="text-xs tracking-editorial uppercase text-ink-soft">
              Price (Rp)
            </label>
            <input
              id="price"
              name="price"
              type="number"
              min="0"
              step="1"
              defaultValue={product.price}
              required
              className="mt-1 w-full border border-border bg-off-white px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label htmlFor="category_id" className="text-xs tracking-editorial uppercase text-ink-soft">
              Category
            </label>
            <select
              id="category_id"
              name="category_id"
              defaultValue={product.category_id ?? ""}
              className="mt-1 w-full border border-border bg-off-white px-3 py-2 text-sm"
            >
              <option value="">No category</option>
              {categories?.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="status" className="text-xs tracking-editorial uppercase text-ink-soft">
              Status
            </label>
            <select
              id="status"
              name="status"
              defaultValue={product.status}
              className="mt-1 w-full max-w-xs border border-border bg-off-white px-3 py-2 text-sm"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              id="is_featured"
              name="is_featured"
              type="checkbox"
              defaultChecked={product.is_featured}
              className="h-4 w-4"
            />
            <label htmlFor="is_featured" className="text-xs tracking-editorial uppercase text-ink-soft">
              Featured product
            </label>
          </div>

          <button
            type="submit"
            className="border border-ink bg-ink px-4 py-2 text-xs tracking-editorial uppercase text-off-white hover:bg-ink-soft transition-colors"
          >
            Save Changes
          </button>
        </form>
      </div>

      <div className="mt-8 border border-red-600 bg-red-50 p-6">
        <h2 className="text-xs tracking-editorial uppercase text-red-600">Danger Zone</h2>
        <p className="mt-2 text-sm text-red-600">
          Menghapus produk ini bersifat permanen dan tidak dapat dibatalkan.
        </p>
        <form action={boundDelete} className="mt-4">
          <button
            type="submit"
            className="border border-red-600 px-4 py-2 text-xs tracking-editorial uppercase text-red-600 hover:bg-red-600 hover:text-off-white transition-colors"
          >
            Delete Product
          </button>
        </form>
      </div>
    </div>
  );
}
