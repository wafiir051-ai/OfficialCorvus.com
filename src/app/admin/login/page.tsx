"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signInAdmin } from "@/lib/actions/admin-auth";

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const notAdminError = searchParams.get("error") === "not_admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const result = await signInAdmin(email, password);

    if (!result.ok) {
      setError(result.error);
      setSubmitting(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <main className="flex w-full min-h-screen items-center justify-center bg-off-white px-4">
      <div className="w-full max-w-sm border border-border bg-off-white-soft p-8">
        <h1 className="text-center font-display text-3xl tracking-editorial">
          CORVUS
        </h1>
        <p className="mt-1 text-center text-xs tracking-editorial uppercase text-ink-soft">
          Admin
        </p>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
          <div>
            <label className="text-xs tracking-editorial uppercase text-ink-soft">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full border border-border bg-off-white px-3 py-2 text-sm focus:border-ink focus:outline-none"
              placeholder="admin@corvus.com"
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
              className="mt-1 w-full border border-border bg-off-white px-3 py-2 text-sm focus:border-ink focus:outline-none"
            />
          </div>

          {(error || notAdminError) && (
            <p className="border border-red-600 bg-red-50 px-3 py-2 text-sm text-danger">
              {error ?? "That account does not have admin access."}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 w-full bg-ink px-6 py-3 text-sm tracking-editorial uppercase text-off-white transition-colors hover:bg-ink-soft disabled:cursor-not-allowed disabled:bg-stone"
          >
            {submitting ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </main>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <AdminLoginForm />
    </Suspense>
  );
}
