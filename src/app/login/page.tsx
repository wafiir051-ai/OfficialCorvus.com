"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  getGoogleSignInUrl,
  checkAccountExists,
  signInWithPassword,
} from "@/lib/actions/customer-auth";

type Step = "identify" | "password";

export default function CustomerLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";

  const [step, setStep] = useState<Step>("identify");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGoogleSignIn() {
    setSubmitting(true);
    setError(null);

    const result = await getGoogleSignInUrl();

    if (!result.ok) {
      setError(result.error);
      setSubmitting(false);
      return;
    }

    window.location.href = result.url;
  }

  async function handleCheckAccount(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const result = await checkAccountExists(email);

    setSubmitting(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    if (!result.exists) {
      router.push(`/register?email=${encodeURIComponent(email)}&redirect=${encodeURIComponent(redirectTo)}`);
      return;
    }

    setStep("password");
  }

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const result = await signInWithPassword(email, password);

    if (!result.ok) {
      setError(result.error);
      setSubmitting(false);
      return;
    }

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
          Sign in to shop and track your orders
        </p>

        <div className="mt-8 flex flex-col gap-4">
          {step === "identify" && (
            <>
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={submitting}
                className="flex w-full items-center justify-center gap-3 border border-border px-6 py-3 text-sm hover:bg-off-white-soft transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </button>

              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs text-stone-dark uppercase tracking-editorial">or</span>
                <div className="h-px flex-1 bg-border" />
              </div>

              <form onSubmit={handleCheckAccount} className="flex flex-col gap-4">
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

                {error && <p className="text-sm text-danger">{error}</p>}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-ink px-6 py-3 text-sm tracking-editorial uppercase text-off-white transition-colors hover:bg-ink-soft disabled:cursor-not-allowed disabled:bg-stone"
                >
                  {submitting ? "Checking..." : "Continue"}
                </button>
              </form>
            </>
          )}

          {step === "password" && (
            <form onSubmit={handleSignIn} className="flex flex-col gap-4">
              <div>
                <label className="text-xs tracking-editorial uppercase text-ink-soft">
                  Password
                </label>
                <p className="mt-1 text-xs text-stone-dark">Signing in as {email}</p>
                <input
                  type="password"
                  required
                  autoFocus
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="mt-2 w-full border border-border px-3 py-2 text-sm focus:border-ink focus:outline-none"
                />
              </div>

              {error && <p className="text-sm text-danger">{error}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-ink px-6 py-3 text-sm tracking-editorial uppercase text-off-white transition-colors hover:bg-ink-soft disabled:cursor-not-allowed disabled:bg-stone"
              >
                {submitting ? "Signing in..." : "Sign In"}
              </button>

              <div className="flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setStep("identify");
                    setPassword("");
                    setError(null);
                  }}
                  className="text-stone-dark underline hover:text-ink"
                >
                  Use a different email
                </button>
                <Link href="/forgot-password" className="text-stone-dark underline hover:text-ink">
                  Forgot password?
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
