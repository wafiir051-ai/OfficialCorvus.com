import Link from "next/link";
import { formatPrice } from "@/lib/utils/format";
import type { ProductListItem } from "@/lib/services/catalog";

export function ProductCard({ product }: { product: ProductListItem }) {
  return (
    <Link href={`/product/${product.slug}`} className="group">
      <div className="aspect-[3/4] w-full overflow-hidden bg-off-white-soft">
        {product.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image_url}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-xs tracking-editorial uppercase text-stone-dark">
              No Image
            </span>
          </div>
        )}
      </div>
      <h3 className="mt-3 text-sm">{product.name}</h3>
      <div className="mt-1 flex items-center gap-2">
        <span className="text-sm text-ink-soft">{formatPrice(product.price)}</span>
        {product.compare_at_price && (
          <span className="text-xs text-stone-dark line-through">
            {formatPrice(product.compare_at_price)}
          </span>
        )}
      </div>
    </Link>
  );
}
