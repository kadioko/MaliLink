"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";

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
  const [form, setForm] = useState<RegisterFormState>(initialFormState);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      email: form.email,
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-amber-50 py-12 px-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-emerald-800">Join MaliLink</h1>
          <p className="text-gray-500 mt-2">Register your business in minutes</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                placeholder="Fatma Hassan"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
              <input
                type="text"
                name="businessName"
                value={form.businessName}
                onChange={(event) => setForm((current) => ({ ...current, businessName: event.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                placeholder="Hassan Imports Ltd"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">I am a...</label>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-center justify-center p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-emerald-500 transition">
                <input
                  type="radio"
                  name="role"
                  value="IMPORTER"
                  checked={form.role === "IMPORTER"}
                  onChange={() => setForm((current) => ({ ...current, role: "IMPORTER" }))}
                  className="mr-2"
                />
                <span className="font-medium">Importer / Buyer</span>
              </label>
              <label className="flex items-center justify-center p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-emerald-500 transition">
                <input
                  type="radio"
                  name="role"
                  value="SUPPLIER"
                  checked={form.role === "SUPPLIER"}
                  onChange={() => setForm((current) => ({ ...current, role: "SUPPLIER" }))}
                  className="mr-2"
                />
                <span className="font-medium">Supplier</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone (WhatsApp)</label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              placeholder="+255 7XX XXX XXX"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              placeholder="fatma@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              placeholder="Create a strong password"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              type="text"
              name="location"
              value={form.location}
              onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              placeholder="Kariakoo, Dar es Salaam"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              TIN Number (optional)
            </label>
            <input
              type="text"
              name="tinNumber"
              value={form.tinNumber}
              onChange={(event) => setForm((current) => ({ ...current, tinNumber: event.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              placeholder="TIN number for verified status"
            />
          </div>

          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Already have an account?{" "}
            <Link href="/login" className="text-emerald-600 font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
