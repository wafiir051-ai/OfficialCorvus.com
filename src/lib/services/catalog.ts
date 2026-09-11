import { createClient } from "@/lib/supabase/server";

export type Category = {
  id: string;
  name: string;
  slug: string;
};

export type ProductListItem = {
  id: string;
  name: string;
  slug: string;
  price: number;
  compare_at_price: number | null;
  image_url: string | null;
  categorySlug: string | null;
  sizes: string[];
  colors: string[];
  createdAt: string;
};

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("getCategories error:", error.message);
    return [];
  }

  return data ?? [];
}

/**
 * Fetch all published products, optionally filtered by category slug.
 * Includes variant sizes/colors so the shop page can filter client-side.
 */
export async function getProducts(categorySlug?: string): Promise<ProductListItem[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select(
      `
      id, name, slug, price, compare_at_price, category_id, created_at,
      product_images ( storage_path, sort_order ),
      categories ( slug ),
      product_variants ( size, color )
      `
    )
    .eq("status", "published")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getProducts error:", error.message);
    return [];
  }

  type Row = {
    id: string;
    name: string;
    slug: string;
    price: number;
    compare_at_price: number | null;
    created_at: string;
    product_images: { storage_path: string; sort_order: number }[] | null;
    categories: { slug: string } | null;
    product_variants: { size: string; color: string }[] | null;
  };

  const rows = (data ?? []) as unknown as Row[];

  const filtered = categorySlug
    ? rows.filter((p) => p.categories?.slug === categorySlug)
    : rows;

  return filtered.map((p) => {
    const images = p.product_images ?? [];
    const firstImage = [...images].sort((a, b) => a.sort_order - b.sort_order)[0];
    const image_url = firstImage
      ? supabase.storage.from("product-images").getPublicUrl(firstImage.storage_path).data.publicUrl
      : null;
    const variants = p.product_variants ?? [];
    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: p.price,
      compare_at_price: p.compare_at_price,
      image_url,
      categorySlug: p.categories?.slug ?? null,
      sizes: Array.from(new Set(variants.map((v) => v.size))),
      colors: Array.from(new Set(variants.map((v) => v.color))),
      createdAt: p.created_at,
    };
  });
}

/**
 * Fetch other published products in the same category, excluding the given product.
 * Falls back to most recent products if no category match.
 */
export async function getRelatedProducts(
  categorySlug: string | null,
  excludeSlug: string,
  limit = 4
): Promise<ProductListItem[]> {
  const products = await getProducts(categorySlug ?? undefined);
  const filtered = products.filter((p) => p.slug !== excludeSlug);

  if (filtered.length >= limit || categorySlug) {
    return filtered.slice(0, limit);
  }

  const fallback = await getProducts();
  return fallback.filter((p) => p.slug !== excludeSlug).slice(0, limit);
}
