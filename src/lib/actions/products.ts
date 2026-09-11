"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function deleteProductAction(productId: string) {
  const supabaseAdmin = createAdminClient();
  await supabaseAdmin.from("products").delete().eq("id", productId);
  revalidatePath("/admin/products");
  redirect("/admin/products");
}
