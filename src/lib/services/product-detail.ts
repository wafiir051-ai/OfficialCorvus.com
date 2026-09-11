import { createClient } from "@/lib/supabase/server";

export type ProductVariantDetail = {
  id: string;
  size: string;
  color: string;
  sku: string;
  price_override: number | null;
  quantity: number;
};

export type ProductDetail = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  material: string | null;
  care_instructions: string | null;
  categorySlug: string | null;
  categoryName: string | null;
  images: { storage_path: string; alt_text: string | null; sort_order: number }[];
  variants: ProductVariantDetail[];
};

export async function getProductBySlug(slug: string): Promise<ProductDetail | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select(
      `
      id, name, slug, description, price, compare_at_price, material, care_instructions,
      product_images ( storage_path, alt_text, sort_order ),
      categories ( slug, name ),
      product_variants (        id, size, color, sku, price_override,
        inventory ( quantity )
      )
      `
    )
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (error || !data) {
    if (error) console.error("getProductBySlug error:", error.message);
    return null;
  }

  type VariantRow = {
    id: string;
    size: string;
    color: string;
    sku: string;
    price_override: number | null;
    inventory: { quantity: number } | { quantity: number }[] | null;
  };

  const variants = ((data.product_variants ?? []) as unknown as VariantRow[]).map((v) => {
    const inv = Array.isArray(v.inventory) ? v.inventory[0] : v.inventory;
    return {
      id: v.id,
      size: v.size,
      color: v.color,
      sku: v.sku,
      price_override: v.price_override,
      quantity: inv?.quantity ?? 0,
    };
  });

  const rawImages = (data.product_images ?? []) as unknown as ProductDetail["images"];
  const images = rawImages
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((img) => ({
      ...img,
      storage_path: supabase.storage.from("product-images").getPublicUrl(img.storage_path).data.publicUrl,
    }));

  const categoryInfo = (data.categories ?? null) as unknown as { slug: string; name: string } | null;

  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
    description: data.description,
    price: data.price,
    compare_at_price: data.compare_at_price,
    material: data.material,
    care_instructions: data.care_instructions,
    categorySlug: categoryInfo?.slug ?? null,
    categoryName: categoryInfo?.name ?? null,
    images,
    variants,
  };
}
