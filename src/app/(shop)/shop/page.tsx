import { getProducts, getCategories } from "@/lib/services/catalog";
import { ShopFilters } from "@/components/product/ShopFilters";

type ShopPageProps = {
  searchParams: Promise<{ category?: string }>;
};

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const { category } = await searchParams;

  const [products, categories] = await Promise.all([
    getProducts(category),
    getCategories(),
  ]);

  const activeCategory = categories.find((cat) => cat.slug === category);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <p className="text-xs tracking-editorial uppercase text-olive">
        {activeCategory ? activeCategory.name : "All Products"}
      </p>
      <h1 className="mt-2 font-display text-6xl leading-[0.95] sm:text-7xl">
        {activeCategory ? activeCategory.name : "Shop"}
      </h1>

      <ShopFilters
        products={products}
        categories={categories}
        activeCategory={category}
      />
    </div>
  );
}
