"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useBag } from "@/context/BagContext";
import { formatPrice } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import type { ProductDetail } from "@/lib/services/product-detail";

export function ProductVariantSelector({ product }: { product: ProductDetail }) {
  const { addItem } = useBag();
  const router = useRouter();

  const sizes = useMemo(
    () => Array.from(new Set(product.variants.map((v) => v.size))),
    [product.variants]
  );
  const colors = useMemo(
    () => Array.from(new Set(product.variants.map((v) => v.color))),
    [product.variants]
  );

  const [selectedSize, setSelectedSize] = useState<string | null>(
    sizes.length === 1 ? sizes[0] : null
  );
  const [selectedColor, setSelectedColor] = useState<string | null>(
    colors.length === 1 ? colors[0] : null
  );
  const [added, setAdded] = useState(false);

  const selectedVariant = product.variants.find(
    (v) => v.size === selectedSize && v.color === selectedColor
  );

  const outOfStock = selectedVariant ? selectedVariant.quantity <= 0 : false;
  const canAdd = Boolean(selectedVariant) && !outOfStock;
  const price = selectedVariant?.price_override ?? product.price;

  function handleAddToBag() {
    if (!selectedVariant) return;
    addItem({
      variantId: selectedVariant.id,
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      size: selectedVariant.size,
      color: selectedVariant.color,
      price,
      imageUrl: product.images[0]?.storage_path ?? null,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  function handleOrderNow() {
    if (!selectedVariant) return;
    handleAddToBag();
    router.push("/bag");
  }

  return (
    <div>
      <div className="flex items-baseline gap-3">
        <span className="text-xl">{formatPrice(price)}</span>
        {product.compare_at_price && (
          <span className="text-sm text-stone-dark line-through">
            {formatPrice(product.compare_at_price)}
          </span>
        )}
      </div>

      {/* Size selector */}
      <div className="mt-6">
        <h3 className="text-xs tracking-editorial uppercase text-ink-soft">Size</h3>
        <div className="mt-2 flex flex-wrap gap-2">
          {sizes.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => setSelectedSize(size)}
              className={cn(
                "min-w-[3rem] border px-3 py-2 text-sm transition-colors",
                selectedSize === size
                  ? "border-ink bg-ink text-off-white"
                  : "border-border hover:border-ink"
              )}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Color selector */}
      <div className="mt-6">
        <h3 className="text-xs tracking-editorial uppercase text-ink-soft">Color</h3>
        <div className="mt-2 flex flex-wrap gap-2">
          {colors.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setSelectedColor(color)}
              className={cn(
                "border px-3 py-2 text-sm transition-colors",
                selectedColor === color
                  ? "border-ink bg-ink text-off-white"
                  : "border-border hover:border-ink"
              )}
            >
              {color}
            </button>
          ))}
        </div>
      </div>

      {selectedVariant && outOfStock && (
        <p className="mt-4 text-sm text-danger">This size/color is out of stock.</p>
      )}

      {/* Actions */}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={handleAddToBag}
          disabled={!canAdd}
          className={cn(
            "flex-1 border border-ink px-6 py-3 text-sm tracking-editorial uppercase transition-colors",
            canAdd
              ? "text-ink hover:bg-ink hover:text-off-white"
              : "cursor-not-allowed border-stone text-stone-dark"
          )}
        >
          {added ? "Added" : "Add to Bag"}
        </button>
        <button
          type="button"
          onClick={handleOrderNow}
          disabled={!canAdd}
          className={cn(
            "flex-1 px-6 py-3 text-sm tracking-editorial uppercase transition-colors",
            canAdd
              ? "bg-ink text-off-white hover:bg-ink-soft"
              : "cursor-not-allowed bg-stone text-stone-dark"
          )}
        >
          Order via WhatsApp
        </button>
      </div>

      {!selectedVariant && (
        <p className="mt-3 text-xs text-stone-dark">
          Select a size and color to continue.
        </p>
      )}
    </div>
  );
}
