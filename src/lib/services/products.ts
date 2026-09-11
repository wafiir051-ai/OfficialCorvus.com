import { createClient } from "@/lib/supabase/server";

export type ProductWithImage = {
  id: string;
  name: string;
  slug: string;
  price: number;
  compare_at_price: number | null;
  image_url: string | null;
};

/**
 * Fetch featured, published products for the homepage.
 * Public/RLS-safe — uses the server client (anon role), relies on
 * the "public read published products" RLS policy.
 */
export async function getFeaturedProducts(limit = 4): Promise<ProductWithImage[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select(
      `
      id, name, slug, price, compare_at_price,
      product_images ( storage_path, sort_order )
    `
    )
    .eq("status", "published")
    .eq("is_featured", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("getFeaturedProducts error:", error.message);
    return [];
  }

  return (data ?? []).map((p) => {
    const images = (p.product_images ?? []) as { storage_path: string; sort_order: number }[];
    const firstImage = [...images].sort((a, b) => a.sort_order - b.sort_order)[0];
    const image_url = firstImage
      ? supabase.storage.from("product-images").getPublicUrl(firstImage.storage_path).data.publicUrl
      : null;
    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: p.price,
      compare_at_price: p.compare_at_price,
      image_url,
    };
  });
}
