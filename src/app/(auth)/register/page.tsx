"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";

type RegisterFormState = {
  name: string;
  businessName: string;
  role: "IMPORTER" | "SUPPLIER";
  phone: string;
  email: string;
  password: string;
  location: string;
  tinNumber: string;
};

const initialFormState: RegisterFormState = {
  name: "",
  businessName: "",
  role: "IMPORTER",
  phone: "",
  email: "",
  password: "",
  location: "",
  tinNumber: "",
};

export default function RegisterPage() {
  const router = useRouter();
  const { status } = useSession();
  const [form, setForm] = useState<RegisterFormState>(initialFormState);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard");
      router.refresh();
    }
  }, [router, status]);

  if (status === "loading" || status === "authenticated") {
    return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-amber-50 px-4 text-sm font-medium text-gray-600">Redirecting to your dashboard...</div>;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...form,
        location: form.location || undefined,
        tinNumber: form.tinNumber || undefined,
      }),
    });

    const payload = await response.json();

    if (!response.ok) {
      setIsSubmitting(false);
      setError(typeof payload.error === "string" ? payload.error : "Failed to create account.");
      return;
    }

    const signInResult = await signIn("credentials", {
      email: form.email.trim().toLowerCase(),
      password: form.password,
      redirect: false,
      callbackUrl: "/dashboard",
    });

    setIsSubmitting(false);

    if (signInResult?.error) {
      setError("Account created, but automatic sign-in failed. Please sign in manually.");
      router.push("/login");
      return;
    }

    router.push(signInResult?.url ?? "/dashboard");
    router.refresh();
  }

  const inputCls = "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20";

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-lg font-bold text-white shadow-lg">
            ML
          </div>
          <h1 className="font-[var(--font-display)] text-3xl font-bold tracking-[-0.04em] text-slate-950">
            Join MaliLink
          </h1>
          <p className="mt-2 text-sm text-[color:var(--muted)]">
            Register your business and start trading in minutes
          </p>
        </div>

        <div className="surface-card-strong overflow-hidden rounded-[2rem] p-8 shadow-[var(--shadow-lg)]">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <p className="mb-3 text-sm font-semibold text-gray-700">I am a…</p>
              <div className="grid grid-cols-2 gap-3">
                {(["IMPORTER", "SUPPLIER"] as const).map((r) => (
                  <label
                    key={r}
                    className={`flex cursor-pointer flex-col gap-1 rounded-2xl border-2 p-4 transition ${
                      form.role === r
                        ? "border-emerald-500 bg-emerald-50"
                        : "border-gray-200 bg-white hover:border-emerald-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={r}
                      checked={form.role === r}
                      onChange={() => setForm((c) => ({ ...c, role: r }))}
                      className="sr-only"
                    />
                    <span className="text-xl">{r === "IMPORTER" ? "🛒" : "🏭"}</span>
                    <span className={`text-sm font-semibold ${form.role === r ? "text-emerald-800" : "text-gray-700"}`}>
                      {r === "IMPORTER" ? "Importer / Buyer" : "Supplier"}
                    </span>
                    <span className="text-xs text-gray-400">
                      {r === "IMPORTER" ? "Source & order goods" : "List & sell products"}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Full Name</label>
                <input type="text" name="name" value={form.name} onChange={(e) => setForm((c) => ({ ...c, name: e.target.value }))} className={inputCls} placeholder="Fatma Hassan" autoComplete="name" required />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Business Name</label>
                <input type="text" name="businessName" value={form.businessName} onChange={(e) => setForm((c) => ({ ...c, businessName: e.target.value }))} className={inputCls} placeholder="Hassan Imports Ltd" autoComplete="organization" required />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Phone (WhatsApp)</label>
                <input type="tel" name="phone" value={form.phone} onChange={(e) => setForm((c) => ({ ...c, phone: e.target.value }))} className={inputCls} placeholder="+255 7XX XXX XXX" autoComplete="tel" required />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Email</label>
                <input type="email" name="email" value={form.email} onChange={(e) => setForm((c) => ({ ...c, email: e.target.value }))} className={inputCls} placeholder="fatma@example.com" autoComplete="email" required />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Password</label>
              <input type="password" name="password" value={form.password} onChange={(e) => setForm((c) => ({ ...c, password: e.target.value }))} className={inputCls} placeholder="Min. 8 characters" autoComplete="new-password" required minLength={8} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Location <span className="text-gray-400 font-normal">(optional)</span></label>
                <input type="text" name="location" value={form.location} onChange={(e) => setForm((c) => ({ ...c, location: e.target.value }))} className={inputCls} placeholder="Kariakoo, Dar es Salaam" autoComplete="address-level2" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">TIN Number <span className="text-gray-400 font-normal">(optional)</span></label>
                <input type="text" name="tinNumber" value={form.tinNumber} onChange={(e) => setForm((c) => ({ ...c, tinNumber: e.target.value }))} className={inputCls} placeholder="For verified status" autoComplete="off" />
              </div>
            </div>

            {error ? (
              <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <span className="mt-0.5 shrink-0">⚠️</span>
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Creating account…" : "Create Account →"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-[color:var(--muted)]">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-emerald-700 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
