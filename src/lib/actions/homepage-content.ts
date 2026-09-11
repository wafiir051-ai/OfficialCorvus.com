"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentAdmin } from "@/lib/actions/admin-auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

async function uploadIfPresent(
  supabaseAdmin: ReturnType<typeof createAdminClient>,
  sectionKey: string,
  slot: string,
  file: File | null
): Promise<string | undefined> {
  if (!file || file.size === 0) return undefined;

  const ext = file.name.split(".").pop() || "jpg";
  const path = `homepage/${sectionKey}-${slot}-${Date.now()}.${ext}`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from("product-images")
    .upload(path, file, { upsert: true });

  if (uploadError) return undefined;

  const { data: publicUrlData } = supabaseAdmin.storage
    .from("product-images")
    .getPublicUrl(path);
  return publicUrlData.publicUrl;
}

export async function updateHomepageSection(sectionKey: string, formData: FormData) {
  const currentAdmin = await getCurrentAdmin();
  if (!currentAdmin) {
    redirect("/admin/login");
  }

  const heading = String(formData.get("heading") || "").trim();
  const body = String(formData.get("body") || "").trim();
  const linkLabel = String(formData.get("link_label") || "").trim();
  const linkUrl = String(formData.get("link_url") || "").trim();

  const supabaseAdmin = createAdminClient();

  const updates: {
    heading: string | null;
    body: string | null;
    link_label: string | null;
    link_url: string | null;
    updated_at: string;
    image_url?: string;
    image_url_2?: string;
    image_url_3?: string;
    image_url_4?: string;
  } = {
    heading: heading || null,
    body: body || null,
    link_label: linkLabel || null,
    link_url: linkUrl || null,
    updated_at: new Date().toISOString(),
  };

  const image1 = await uploadIfPresent(
    supabaseAdmin,
    sectionKey,
    "1",
    formData.get("image") as File | null
  );
  if (image1) updates.image_url = image1;

  const image2 = await uploadIfPresent(
    supabaseAdmin,
    sectionKey,
    "2",
    formData.get("image_2") as File | null
  );
  if (image2) updates.image_url_2 = image2;

  const image3 = await uploadIfPresent(
    supabaseAdmin,
    sectionKey,
    "3",
    formData.get("image_3") as File | null
  );
  if (image3) updates.image_url_3 = image3;

  const image4 = await uploadIfPresent(
    supabaseAdmin,
    sectionKey,
    "4",
    formData.get("image_4") as File | null
  );
  if (image4) updates.image_url_4 = image4;

  const { error } = await supabaseAdmin
    .from("homepage_content")
    .update(updates)
    .eq("section_key", sectionKey);

  if (error) {
    redirect("/admin/content?error=update_failed");
  }

  revalidatePath("/");
  revalidatePath("/admin/content");
  redirect("/admin/content?saved=1");
}

export async function addHeroImages(formData: FormData) {
  const currentAdmin = await getCurrentAdmin();
  if (!currentAdmin) {
    redirect("/admin/login");
  }

  const supabaseAdmin = createAdminClient();
  const files = formData.getAll("hero_images") as File[];

  const { data: existing } = await supabaseAdmin
    .from("homepage_content")
    .select("hero_images")
    .eq("section_key", "hero")
    .single();

  const currentImages: string[] = Array.isArray(existing?.hero_images)
    ? (existing.hero_images as string[])
    : [];

  const newUrls: string[] = [];
  for (const file of files) {
    if (!file || file.size === 0) continue;
    const ext = file.name.split(".").pop() || "jpg";
    const path = `homepage/hero-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from("product-images")
      .upload(path, file, { upsert: true });

    if (!uploadError) {
      const { data: publicUrlData } = supabaseAdmin.storage
        .from("product-images")
        .getPublicUrl(path);
      newUrls.push(publicUrlData.publicUrl);
    }
  }

  const updatedImages = [...currentImages, ...newUrls];

  const { error } = await supabaseAdmin
    .from("homepage_content")
    .update({ hero_images: updatedImages, updated_at: new Date().toISOString() })
    .eq("section_key", "hero");

  if (error) {
    redirect("/admin/content?error=update_failed");
  }

  revalidatePath("/");
  revalidatePath("/admin/content");
  redirect("/admin/content?saved=1");
}

export async function replaceHeroImage(formData: FormData) {
  const currentAdmin = await getCurrentAdmin();
  if (!currentAdmin) {
    redirect("/admin/login");
  }

  const oldUrl = String(formData.get("old_url") || "");
  const newFile = formData.get("new_file") as File | null;

  if (!newFile || newFile.size === 0) {
    redirect("/admin/content?error=update_failed");
  }

  const supabaseAdmin = createAdminClient();

  const ext = newFile!.name.split(".").pop() || "jpg";
  const path = `homepage/hero-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from("product-images")
    .upload(path, newFile!, { upsert: true });

  if (uploadError) {
    redirect("/admin/content?error=update_failed");
  }

  const { data: publicUrlData } = supabaseAdmin.storage
    .from("product-images")
    .getPublicUrl(path);
  const newUrl = publicUrlData.publicUrl;

  const { data: existing } = await supabaseAdmin
    .from("homepage_content")
    .select("hero_images")
    .eq("section_key", "hero")
    .single();

  const currentImages: string[] = Array.isArray(existing?.hero_images)
    ? (existing.hero_images as string[])
    : [];

  const updatedImages = currentImages.map((url) => (url === oldUrl ? newUrl : url));

  const { error } = await supabaseAdmin
    .from("homepage_content")
    .update({ hero_images: updatedImages, updated_at: new Date().toISOString() })
    .eq("section_key", "hero");

  if (error) {
    redirect("/admin/content?error=update_failed");
  }

  revalidatePath("/");
  revalidatePath("/admin/content");
  redirect("/admin/content?saved=1");
}

export async function removeHeroImage(formData: FormData) {
  const currentAdmin = await getCurrentAdmin();
  if (!currentAdmin) {
    redirect("/admin/login");
  }

  const urlToRemove = String(formData.get("url") || "");
  const supabaseAdmin = createAdminClient();

  const { data: existing } = await supabaseAdmin
    .from("homepage_content")
    .select("hero_images")
    .eq("section_key", "hero")
    .single();

  const currentImages: string[] = Array.isArray(existing?.hero_images)
    ? (existing.hero_images as string[])
    : [];

  const updatedImages = currentImages.filter((url) => url !== urlToRemove);

  const { error } = await supabaseAdmin
    .from("homepage_content")
    .update({ hero_images: updatedImages, updated_at: new Date().toISOString() })
    .eq("section_key", "hero");

  if (error) {
    redirect("/admin/content?error=update_failed");
  }

  revalidatePath("/");
  revalidatePath("/admin/content");
  redirect("/admin/content?saved=1");
}
