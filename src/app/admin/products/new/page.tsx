import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ImageIcon } from "lucide-react";

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

async function createProduct(formData: FormData) {
  "use server";

  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const priceRaw = String(formData.get("price") || "");
  const categoryId = String(formData.get("category_id") || "").trim();

  const price = Number(priceRaw);

  if (!name || !description || !priceRaw || Number.isNaN(price) || price < 0) {
    redirect("/admin/products/new?error=invalid");
  }

  const supabaseAdmin = createAdminClient();

  let slug = slugify(name);

  const { data: existing } = await supabaseAdmin
    .from("products")
    .select("slug")
    .like("slug", `${slug}%`);

  if (existing && existing.length > 0) {
    const taken = new Set(existing.map((p) => p.slug));
    if (taken.has(slug)) {
      let i = 2;
      while (taken.has(`${slug}-${i}`)) i++;
      slug = `${slug}-${i}`;
    }
  }

  const { data: product, error } = await supabaseAdmin
    .from("products")
    .insert({
      name,
      slug,
      description,
      price,
      category_id: categoryId || null,
      status: "draft",
      is_featured: false,
    })
    .select("id")
    .single();

  if (error || !product) {
    redirect("/admin/products/new?error=insert_failed");
  }

  redirect(`/admin/products/${product.id}`);
}

export default async function NewProductPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabaseAdmin = createAdminClient();

  const { data: categories } = await supabaseAdmin
    .from("categories")
    .select("id, name")
    .order("name", { ascending: true });

  return (
    <div>
      <div className="flex items-center justify-between border-b border-border pb-6">
        <h1 className="font-display text-3xl tracking-editorial">New Product</h1>
        <Link href="/admin/products" className="text-xs tracking-editorial uppercase underline">
          Back to Products
        </Link>
      </div>

      {error && (
        <p className="mt-4 border border-red-600 bg-red-50 px-4 py-2 text-sm text-red-600">
          {error === "invalid"
            ? "Nama, deskripsi, dan harga wajib diisi dengan benar."
            : "Gagal membuat produk. Coba lagi."}
        </p>
      )}

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
        {/* Form */}
        <div className="border border-border bg-off-white-soft p-6">
          <form action={createProduct} className="space-y-6">
            <div>
              <label htmlFor="name" className="text-xs tracking-editorial uppercase text-ink-soft">
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
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
                defaultValue=""
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

            <button
              type="submit"
              className="border border-ink bg-ink px-4 py-2 text-xs tracking-editorial uppercase text-off-white hover:bg-ink-soft transition-colors"
            >
              Create Product
            </button>
          </form>
        </div>

        {/* Info panel */}
        <div className="flex flex-col gap-4">
          <div className="border border-border bg-off-white p-6">
            <div className="flex aspect-square w-full items-center justify-center border border-dashed border-stone bg-off-white-soft">
              <div className="flex flex-col items-center gap-2 text-center px-4">
                <ImageIcon className="h-8 w-8 text-stone-dark" strokeWidth={1.5} />
                <p className="text-xs text-stone-dark">
                  Gambar produk dan varian (size, color, stok) bisa ditambahkan
                  setelah produk ini dibuat.
                </p>
              </div>
            </div>
          </div>

          <div className="border border-border bg-off-white-soft p-6">
            <h3 className="text-xs tracking-editorial uppercase text-ink-soft">
              Langkah Berikutnya
            </h3>
            <ol className="mt-3 space-y-2 text-sm text-ink-soft list-decimal list-inside">
              <li>Isi detail produk di sebelah kiri lalu klik &quot;Create Product&quot;.</li>
              <li>Upload foto produk di halaman edit.</li>
              <li>Tambah varian (size &amp; color) beserta stoknya.</li>
              <li>Ubah status dari Draft ke Published saat siap dijual.</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
