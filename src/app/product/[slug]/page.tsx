import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/services/product-detail";
import { getRelatedProducts } from "@/lib/services/catalog";
import { ProductVariantSelector } from "@/components/product/ProductVariantSelector";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductCard } from "@/components/product/ProductCard";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const related = await getRelatedProducts(product.categorySlug, product.slug);
  const sizes = Array.from(new Set(product.variants.map((v) => v.size)));

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-8 flex flex-wrap items-center gap-1 text-xs tracking-editorial uppercase text-stone-dark">
        <Link href="/" className="hover:text-ink transition-colors">Home</Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-ink transition-colors">Shop</Link>
        {product.categoryName && (
          <>
            <span>/</span>
            <Link
              href={`/shop?category=${product.categorySlug}`}
              className="hover:text-ink transition-colors"
            >
              {product.categoryName}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-ink">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
        {/* Gallery */}
        <ProductGallery images={product.images} productName={product.name} />

        {/* Details */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <h1 className="font-display text-5xl leading-[0.95] tracking-editorial sm:text-6xl">
            {product.name}
          </h1>

          <div className="mt-8 border-t border-ink pt-8">
            <ProductVariantSelector product={product} />
          </div>

          {sizes.length > 0 && (
            <div className="mt-8 border-t border-ink pt-8">
              <h2 className="border-b border-stone pb-2 text-xs tracking-editorial uppercase text-ink-soft">
                Size Chart (cm)
              </h2>
              <table className="mt-3 w-full text-sm text-ink-soft">
                <thead>
                  <tr className="text-left text-xs tracking-editorial uppercase text-stone-dark">
                    <th className="py-1 pr-4">Size</th>
                    <th className="py-1 pr-4">Lebar</th>
                    <th className="py-1">Panjang</th>
                  </tr>
                </thead>
                <tbody>
                  {sizes.map((size) => (
                    <tr key={size} className="border-t border-border">
                      <td className="py-1.5 pr-4">{size}</td>
                      <td className="py-1.5 pr-4 text-stone-dark">—</td>
                      <td className="py-1.5 text-stone-dark">—</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="mt-2 text-xs text-stone-dark">
                Ukuran dapat bervariasi ±2cm.
              </p>
            </div>
          )}

          {(product.description || product.material || product.care_instructions) && (
            <div className="mt-10 space-y-8 border-t border-ink pt-8">
              {product.description && (
                <div>
                  <h2 className="border-b border-stone pb-2 text-xs tracking-editorial uppercase text-ink-soft">
                    Details
                  </h2>
                  <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-ink-soft">
                    {product.description}
                  </p>
                </div>
              )}

              {product.material && (
                <div>
                  <h2 className="border-b border-stone pb-2 text-xs tracking-editorial uppercase text-ink-soft">
                    Material
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                    {product.material}
                  </p>
                </div>
              )}

              {product.care_instructions && (
                <div>
                  <h2 className="border-b border-stone pb-2 text-xs tracking-editorial uppercase text-ink-soft">
                    Care
                  </h2>
                  <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-ink-soft">
                    {product.care_instructions}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* You may also like */}
      {related.length > 0 && (
        <section className="mt-20 border-t border-ink pt-10">
          <h2 className="font-display text-3xl">You may also like</h2>
          <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
