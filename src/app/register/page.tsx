"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signUpWithPassword } from "@/lib/actions/customer-auth";

export default function CustomerRegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";
  const prefillEmail = searchParams.get("email") || "";

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState(prefillEmail);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleRegister(e: React.FormEvent) {
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
    const result = await signUpWithPassword(email, password, fullName);
    setSubmitting(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    // Account is created and the user is already signed in (no email
    // confirmation step is used), so go straight to the intended page.
    setDone(true);
    router.push(redirectTo);
    router.refresh();
  }

  return (
    <main className="flex w-full min-h-screen items-center justify-center bg-off-white px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-center font-display text-2xl tracking-editorial">
          CORVUS
        </h1>
        <p className="mt-2 text-center text-sm text-ink-soft">
          Create your account
        </p>

        <form onSubmit={handleRegister} className="mt-8 flex flex-col gap-4">
          <div>
            <label className="text-xs tracking-editorial uppercase text-ink-soft">
              Full name
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your name"
              className="mt-1 w-full border border-border px-3 py-2 text-sm focus:border-ink focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs tracking-editorial uppercase text-ink-soft">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="mt-1 w-full border border-border px-3 py-2 text-sm focus:border-ink focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs tracking-editorial uppercase text-ink-soft">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              className="mt-1 w-full border border-border px-3 py-2 text-sm focus:border-ink focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs tracking-editorial uppercase text-ink-soft">
              Confirm password
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
            {submitting ? "Creating account..." : "Create Account"}
          </button>

          <button
            type="button"
            onClick={() => router.push(`/login?redirect=${encodeURIComponent(redirectTo)}`)}
            className="text-xs text-stone-dark underline hover:text-ink"
          >
            Already have an account? Sign in
          </button>
        </form>
      </div>
    </main>
  );
}
