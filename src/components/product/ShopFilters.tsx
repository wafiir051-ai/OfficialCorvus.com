"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { formatPrice } from "@/lib/utils/format";
import { ProductCard } from "@/components/product/ProductCard";
import type { Category, ProductListItem } from "@/lib/services/catalog";

type SortKey = "newest" | "price-asc" | "price-desc";

const SORT_LABELS: Record<SortKey, string> = {
  newest: "Newest",
  "price-asc": "Price: Low to High",
  "price-desc": "Price: High to Low",
};

export function ShopFilters({
  products,
  categories,
  activeCategory,
}: {
  products: ProductListItem[];
  categories: Category[];
  activeCategory?: string;
}) {
  const allSizes = useMemo(
    () => Array.from(new Set(products.flatMap((p) => p.sizes))).sort(),
    [products]
  );
  const allColors = useMemo(
    () => Array.from(new Set(products.flatMap((p) => p.colors))).sort(),
    [products]
  );
  const maxPrice = useMemo(
    () => products.reduce((max, p) => Math.max(max, p.price), 0),
    [products]
  );

  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [priceLimit, setPriceLimit] = useState<number>(maxPrice);
  const [sort, setSort] = useState<SortKey>("newest");
  const [sortOpen, setSortOpen] = useState(false);

  function toggle(list: string[], value: string, setList: (v: string[]) => void) {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  }

  const filtered = useMemo(() => {
    let result = products.filter((p) => {
      const sizeOk = selectedSizes.length === 0 || p.sizes.some((s) => selectedSizes.includes(s));
      const colorOk = selectedColors.length === 0 || p.colors.some((c) => selectedColors.includes(c));
      const priceOk = p.price <= priceLimit;
      return sizeOk && colorOk && priceOk;
    });

    result = [...result].sort((a, b) => {
      if (sort === "price-asc") return a.price - b.price;
      if (sort === "price-desc") return b.price - a.price;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return result;
  }, [products, selectedSizes, selectedColors, priceLimit, sort]);

  return (
    <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[220px_1fr]">
      {/* Sidebar filters */}
      <aside className="space-y-8">
        <div>
          <h3 className="text-xs tracking-editorial uppercase text-ink-soft">Category</h3>
          <div className="mt-3 flex flex-col gap-1">
            <Link
              href="/shop"
              className={cn(
                "text-left text-sm py-1 transition-colors",
                !activeCategory ? "text-ink font-medium" : "text-ink-soft hover:text-ink"
              )}
            >
              All
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/shop?category=${cat.slug}`}
                className={cn(
                  "text-left text-sm py-1 transition-colors",
                  activeCategory === cat.slug ? "text-ink font-medium" : "text-ink-soft hover:text-ink"
                )}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>

        {allSizes.length > 0 && (
          <div>
            <h3 className="text-xs tracking-editorial uppercase text-ink-soft">Size</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {allSizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => toggle(selectedSizes, size, setSelectedSizes)}
                  className={cn(
                    "min-w-[2.5rem] border px-2 py-1 text-xs transition-colors",
                    selectedSizes.includes(size)
                      ? "border-ink bg-ink text-off-white"
                      : "border-border hover:border-ink"
                  )}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        {allColors.length > 0 && (
          <div>
            <h3 className="text-xs tracking-editorial uppercase text-ink-soft">Color</h3>
            <div className="mt-3 flex flex-col gap-2">
              {allColors.map((color) => (
                <label key={color} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedColors.includes(color)}
                    onChange={() => toggle(selectedColors, color, setSelectedColors)}
                    className="h-4 w-4 border-border accent-ink"
                  />
                  {color}
                </label>
              ))}
            </div>
          </div>
        )}

        {maxPrice > 0 && (
          <div>
            <h3 className="text-xs tracking-editorial uppercase text-ink-soft">Price</h3>
            <input
              type="range"
              min={0}
              max={maxPrice}
              value={priceLimit}
              onChange={(e) => setPriceLimit(Number(e.target.value))}
              className="mt-3 w-full accent-ink"
            />
            <p className="mt-1 text-xs text-stone-dark">Up to {formatPrice(priceLimit)}</p>
          </div>
        )}
      </aside>

      {/* Product grid */}
      <div>
        <div className="flex items-center justify-between border-b border-ink pb-4">
          <p className="text-sm text-stone-dark">{filtered.length} products</p>
          <div className="relative">
            <button
              type="button"
              onClick={() => setSortOpen((v) => !v)}
              className="flex items-center gap-2 text-xs tracking-editorial uppercase text-ink-soft hover:text-ink transition-colors"
            >
              Sort by: {SORT_LABELS[sort]}
            </button>
            {sortOpen && (
              <div className="absolute right-0 top-full z-10 mt-2 w-48 border border-ink bg-off-white shadow-lg">
                {(Object.keys(SORT_LABELS) as SortKey[]).map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setSort(key);
                      setSortOpen(false);
                    }}
                    className={cn(
                      "block w-full px-4 py-2 text-left text-xs uppercase tracking-editorial hover:bg-off-white-soft",
                      sort === key && "text-olive"
                    )}
                  >
                    {SORT_LABELS[key]}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="mt-12 text-sm text-stone-dark">
            No products match these filters.
          </p>
        ) : (
          <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
