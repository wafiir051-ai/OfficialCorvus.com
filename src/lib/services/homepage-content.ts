import { createClient } from "@/lib/supabase/server";

export type HomepageSection = {
  sectionKey: string;
  heading: string | null;
  body: string | null;
  imageUrl: string | null;
  imageUrl2: string | null;
  imageUrl3: string | null;
  imageUrl4: string | null;
  heroImages: string[];
  linkUrl: string | null;
  linkLabel: string | null;
};

export async function getHomepageContent(): Promise<Record<string, HomepageSection>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("homepage_content")
    .select(
      "section_key, heading, body, image_url, image_url_2, image_url_3, image_url_4, hero_images, link_url, link_label"
    );

  if (error || !data) {
    console.error("getHomepageContent error:", error?.message);
    return {};
  }

  const result: Record<string, HomepageSection> = {};
  for (const row of data) {
    result[row.section_key] = {
      sectionKey: row.section_key,
      heading: row.heading,
      body: row.body,
      imageUrl: row.image_url,
      imageUrl2: row.image_url_2,
      imageUrl3: row.image_url_3,
      imageUrl4: row.image_url_4,
      heroImages: Array.isArray(row.hero_images) ? row.hero_images : [],
      linkUrl: row.link_url,
      linkLabel: row.link_label,
    };
  }
  return result;
}
