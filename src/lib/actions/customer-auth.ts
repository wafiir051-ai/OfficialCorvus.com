"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { headers } from "next/headers";

type ActionResult = { ok: true } | { ok: false; error: string };

export async function getGoogleSignInUrl(): Promise<
  { ok: true; url: string } | { ok: false; error: string }
> {
  const supabase = await createClient();
  const headersList = await headers();
  const origin = headersList.get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  });

  if (error || !data.url) {
    return { ok: false, error: "Could not start Google sign-in." };
  }

  return { ok: true, url: data.url };
}

export async function sendPhoneOtp(phone: string): Promise<ActionResult> {
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithOtp({
    phone,
  });

  if (error) {
    return { ok: false, error: error.message || "Could not send verification code." };
  }

  return { ok: true };
}

export async function verifyPhoneOtp(phone: string, token: string): Promise<ActionResult> {
  const supabase = await createClient();

  const { error } = await supabase.auth.verifyOtp({
    phone,
    token,
    type: "sms",
  });

  if (error) {
    return { ok: false, error: "Invalid or expired code. Please try again." };
  }

  return { ok: true };
}

export async function signOutCustomer(): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    return { ok: false, error: "Could not sign out." };
  }

  return { ok: true };
}

export async function getCurrentCustomer() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("customer_profiles")
    .select("id, full_name, phone, avatar_url")
    .eq("id", user.id)
    .maybeSingle() as {
      data: {
        id: string;
        full_name: string | null;
        phone: string | null;
        avatar_url: string | null;
      } | null;
    };

  return {
    id: user.id,
    email: user.email ?? null,
    full_name: profile?.full_name ?? null,
    phone: profile?.phone ?? user.phone ?? null,
    avatar_url: profile?.avatar_url ?? null,
  };
}
export async function checkAccountExists(
  email: string
): Promise<{ ok: true; exists: boolean } | { ok: false; error: string }> {
  const supabaseAdmin = createAdminClient();

  const { data, error } = await supabaseAdmin
    .from("user_emails")
    .select("id")
    .ilike("email", email.trim())
    .maybeSingle();

  if (error) {
    return { ok: false, error: "Could not check account. Please try again." };
  }

  return { ok: true, exists: Boolean(data) };
}

export async function signInWithPassword(
  email: string,
  password: string
): Promise<ActionResult> {
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { ok: false, error: "Incorrect email or password." };
  }

  return { ok: true };
}

export async function signUpWithPassword(
  email: string,
  password: string,
  fullName: string
): Promise<ActionResult> {
  // Create the user via the admin client with email_confirm forced true,
  // so sign-up works regardless of the dashboard's "Confirm email" setting.
  const supabaseAdmin = createAdminClient();

  const { error: createError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });

  if (createError) {
    if (createError.message?.toLowerCase().includes("already been registered") ||
        createError.message?.toLowerCase().includes("already registered")) {
      return { ok: false, error: "An account with this email already exists." };
    }
    return { ok: false, error: createError.message || "Could not create account." };
  }

  // Immediately sign in so the browser gets an active session.
  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) {
    return { ok: false, error: "Account created, but could not sign you in. Please sign in manually." };
  }

  return { ok: true };
}

export async function sendPasswordResetEmail(email: string): Promise<ActionResult> {
  const supabase = await createClient();
  const headersList = await headers();
  const origin =
    headersList.get("origin") ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    "http://localhost:3000";

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/reset-password`,
  });

  if (error) {
    return { ok: false, error: "Could not send reset email. Please try again." };
  }

  return { ok: true };
}

export async function updatePassword(newPassword: string): Promise<ActionResult> {
  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    return { ok: false, error: "Could not update password. Please try again." };
  }

  return { ok: true };
}
