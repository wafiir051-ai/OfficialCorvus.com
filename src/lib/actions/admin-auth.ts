"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

type SignInResult = { ok: true } | { ok: false; error: string };

export async function signInAdmin(email: string, password: string): Promise<SignInResult> {
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { ok: false, error: "Invalid email or password." };
  }

  return { ok: true };
}

export async function signOutAdmin() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export type CurrentAdmin = {
  id: string;
  fullName: string;
  role: "owner" | "staff";
  email: string | null;
};

export async function getCurrentAdmin(): Promise<CurrentAdmin | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: adminRecord } = (await supabase
    .from("admin_users")
    .select("id, full_name, role")
    .eq("user_id", user.id)
    .maybeSingle()) as {
    data: { id: string; full_name: string; role: "owner" | "staff" } | null;
  };

  if (!adminRecord) return null;

  return {
    id: adminRecord.id,
    fullName: adminRecord.full_name,
    role: adminRecord.role,
    email: user.email ?? null,
  };
}
