"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { sendPasswordResetEmail } from "@/lib/actions/customer-auth";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const result = await sendPasswordResetEmail(email);

    setSubmitting(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setSent(true);
  }

  if (sent) {
    return (
      <main className="flex w-full min-h-screen items-center justify-center bg-off-white px-4">
        <div className="w-full max-w-sm text-center">
          <h1 className="font-display text-2xl tracking-editorial">CORVUS</h1>
          <p className="mt-4 text-sm text-ink-soft">
            If an account exists for <strong>{email}</strong>, we&apos;ve sent
            a password reset link. Please check your inbox.
          </p>
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="mt-6 w-full bg-ink px-6 py-3 text-sm tracking-editorial uppercase text-off-white transition-colors hover:bg-ink-soft"
          >
            Back to Sign In
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
          Reset your password
        </p>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
          <div>
            <label className="text-xs tracking-editorial uppercase text-ink-soft">
              Email
            </label>
            <input
              type="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="mt-1 w-full border border-border px-3 py-2 text-sm focus:border-ink focus:outline-none"
            />
          </div>

          {error && <p className="text-sm text-danger">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-ink px-6 py-3 text-sm tracking-editorial uppercase text-off-white transition-colors hover:bg-ink-soft disabled:cursor-not-allowed disabled:bg-stone"
          >
            {submitting ? "Sending..." : "Send Reset Link"}
          </button>

          <button
            type="button"
            onClick={() => router.push("/login")}
            className="text-xs text-stone-dark underline hover:text-ink"
          >
            Back to sign in
          </button>
        </form>
      </div>
    </main>
  );
}
