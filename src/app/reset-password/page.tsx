"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { updatePassword } from "@/lib/actions/customer-auth";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [hasValidSession, setHasValidSession] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      setHasValidSession(Boolean(data.session));
      setCheckingSession(false);
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    const result = await updatePassword(password);
    setSubmitting(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setDone(true);
  }

  if (checkingSession) {
    return (
      <main className="flex w-full min-h-screen items-center justify-center bg-off-white px-4">
        <p className="text-sm text-ink-soft">Loading...</p>
      </main>
    );
  }

  if (!hasValidSession) {
    return (
      <main className="flex w-full min-h-screen items-center justify-center bg-off-white px-4">
        <div className="w-full max-w-sm text-center">
          <h1 className="font-display text-2xl tracking-editorial">CORVUS</h1>
          <p className="mt-4 text-sm text-ink-soft">
            This password reset link is invalid or has expired. Please request a new one.
          </p>
          <button
            type="button"
            onClick={() => router.push("/forgot-password")}
            className="mt-6 w-full bg-ink px-6 py-3 text-sm tracking-editorial uppercase text-off-white transition-colors hover:bg-ink-soft"
          >
            Request New Link
          </button>
        </div>
      </main>
    );
  }

  if (done) {
    return (
      <main className="flex w-full min-h-screen items-center justify-center bg-off-white px-4">
        <div className="w-full max-w-sm text-center">
          <h1 className="font-display text-2xl tracking-editorial">CORVUS</h1>
          <p className="mt-4 text-sm text-ink-soft">
            Your password has been updated.
          </p>
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="mt-6 w-full bg-ink px-6 py-3 text-sm tracking-editorial uppercase text-off-white transition-colors hover:bg-ink-soft"
          >
            Continue to Sign In
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex w-full min-h-screen items-center justify-center bg-off-white px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-center font-display text-2xl tracking-editorial">
          CORVUS
        </h1>
        <p className="mt-2 text-center text-sm text-ink-soft">
          Set a new password
        </p>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
          <div>
            <label className="text-xs tracking-editorial uppercase text-ink-soft">
              New password
            </label>
            <input
              type="password"
              required
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              className="mt-1 w-full border border-border px-3 py-2 text-sm focus:border-ink focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs tracking-editorial uppercase text-ink-soft">
              Confirm new password
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter password"
              className="mt-1 w-full border border-border px-3 py-2 text-sm focus:border-ink focus:outline-none"
            />
          </div>

          {error && <p className="text-sm text-danger">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-ink px-6 py-3 text-sm tracking-editorial uppercase text-off-white transition-colors hover:bg-ink-soft disabled:cursor-not-allowed disabled:bg-stone"
          >
            {submitting ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </main>
  );
}
