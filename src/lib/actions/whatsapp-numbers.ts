"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentAdmin } from "@/lib/actions/admin-auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

async function requireOwner() {
  const currentAdmin = await getCurrentAdmin();
  if (currentAdmin?.role !== "owner") {
    redirect("/admin?error=forbidden");
  }
}

export async function addWhatsappNumber(formData: FormData) {
  "use server";

  await requireOwner();

  const phoneRaw = String(formData.get("phone_number") || "").trim();
  const weightRaw = String(formData.get("weight") || "1");
  const weight = Number(weightRaw);

  const phone = phoneRaw.replace(/[^\d+]/g, "");

  if (!phone || Number.isNaN(weight) || weight <= 0) {
    redirect("/admin/settings?error=invalid_wa_input");
  }

  const supabaseAdmin = createAdminClient();

  const { error } = await supabaseAdmin.from("whatsapp_numbers").insert({
    phone_number: phone,
    weight,
    is_active: true,
  });

  if (error) {
    redirect("/admin/settings?error=wa_add_failed");
  }

  revalidatePath("/admin/settings");
  redirect("/admin/settings?waAdded=1");
}

export async function toggleWhatsappNumber(id: string, currentlyActive: boolean) {
  "use server";

  await requireOwner();

  const supabaseAdmin = createAdminClient();
  await supabaseAdmin
    .from("whatsapp_numbers")
    .update({ is_active: !currentlyActive })
    .eq("id", id);

  revalidatePath("/admin/settings");
  redirect("/admin/settings?waUpdated=1");
}

export async function removeWhatsappNumber(id: string) {
  "use server";

  await requireOwner();

  const supabaseAdmin = createAdminClient();
  await supabaseAdmin.from("whatsapp_numbers").delete().eq("id", id);

  revalidatePath("/admin/settings");
  redirect("/admin/settings?waRemoved=1");
}
