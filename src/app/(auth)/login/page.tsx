"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { AlertCircle, ArrowRight, Lock, Mail, ShieldCheck } from "lucide-react";

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const loginReason = searchParams.get("reason");

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard");
      router.refresh();
    }
  }, [router, status]);

  if (status === "loading" || status === "authenticated") {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="text-sm font-medium text-[color:var(--muted)]">Redirecting to your dashboard…</div>
      </div>
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const callbackUrl =
      typeof window === "undefined"
        ? "/dashboard"
        : new URLSearchParams(window.location.search).get("callbackUrl") ?? "/dashboard";

    const result = await signIn("credentials", {
      email: email.trim().toLowerCase(),
      password,
      redirect: false,
      callbackUrl,
    });

    setIsSubmitting(false);

    if (result?.error) {
      setError("Invalid email or password. Please try again.");
      return;
    }

    router.push(result?.url ?? "/dashboard");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-lg font-bold text-white shadow-lg">
            ML
          </div>
          <h1 className="font-[var(--font-display)] text-3xl font-bold tracking-[-0.04em] text-slate-950">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-[color:var(--muted)]">
            Sign in to your MaliLink trade account
          </p>
        </div>

        <div className="surface-card-strong overflow-hidden rounded-[2rem] p-8 shadow-[var(--shadow-lg)]">
          {loginReason === "session-expired" ? (
            <div className="mb-5 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              <AlertCircle className="h-4 w-4 shrink-0" />
              Your session expired. Sign in again to continue.
            </div>
          ) : null}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-gray-700">
                <Mail className="h-3.5 w-3.5 text-gray-400" />
                Email address
              </label>
              <input
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                placeholder="you@business.com"
                autoComplete="email"
                required
              />
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Lock className="h-3.5 w-3.5 text-gray-400" />
                  Password
                </label>
                <Link href="/forgot-password" className="text-xs font-medium text-emerald-600 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />
            </div>

            {error ? (
              <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Signing in…" : (
                <>
                  Sign In
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 flex items-center gap-2 text-xs text-gray-400">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            Secured with encrypted session tokens
          </div>
        </div>

        <p className="text-center text-sm text-[color:var(--muted)]">
          No account yet?{" "}
          <Link href="/register" className="font-semibold text-emerald-700 hover:underline">
            Register your business
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="text-sm font-medium text-[color:var(--muted)]">Loading sign-in…</div>
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  );
}
