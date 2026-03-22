"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Suspense, useEffect, useMemo, useState } from "react";

type VerificationChannel = "email" | "phone";

function VerifyPageContent() {
  const searchParams = useSearchParams();
  const { data: session, status, update } = useSession();
  const token = useMemo(() => searchParams.get("token") ?? "", [searchParams]);
  const tokenType = useMemo<VerificationChannel>(() => (searchParams.get("type") === "phone" ? "phone" : "email"), [searchParams]);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isWorking, setIsWorking] = useState(false);

  useEffect(() => {
    if (!token) {
      return;
    }

    let isCancelled = false;

    async function verifyToken() {
      setIsWorking(true);
      setError(null);
      setMessage(null);

      const response = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, type: tokenType }),
      });

      const payload = await response.json();
      if (isCancelled) {
        return;
      }

      setIsWorking(false);

      if (!response.ok) {
        setError(typeof payload.error === "string" ? payload.error : "Unable to verify this token.");
        return;
      }

      setMessage(typeof payload.message === "string" ? payload.message : "Verification complete.");
      await update();
    }

    void verifyToken();

    return () => {
      isCancelled = true;
    };
  }, [token, tokenType, update]);

  async function requestVerification(channel: VerificationChannel) {
    setIsWorking(true);
    setError(null);
    setMessage(null);
    setPreviewUrl(null);

    const response = await fetch("/api/auth/request-verification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channel }),
    });

    const payload = await response.json();
    setIsWorking(false);

    if (!response.ok) {
      setError(typeof payload.error === "string" ? payload.error : "Unable to prepare verification.");
      return;
    }

    setMessage(typeof payload.message === "string" ? payload.message : `Verification prepared for ${channel}.`);
    setPreviewUrl(typeof payload.previewUrl === "string" ? payload.previewUrl : null);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-amber-50 px-4 py-12">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-emerald-800">Verify your account</h1>
          <p className="text-gray-500 mt-2">Confirm your email and phone so your MaliLink account stays trusted and recoverable.</p>
        </div>

        {error ? <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
        {message ? <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{message}</div> : null}
        {previewUrl ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Development preview: <a href={previewUrl} className="font-medium underline break-all">{previewUrl}</a>
          </div>
        ) : null}

        {token ? (
          <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-4 text-sm text-gray-600">
            {isWorking ? "Verifying your secure link..." : "Verification request processed."}
          </div>
        ) : status === "loading" ? (
          <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-4 text-sm text-gray-600">Loading your verification status...</div>
        ) : status !== "authenticated" || !session?.user ? (
          <div className="space-y-3">
            <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-4 text-sm text-gray-600">
              Sign in first if you want us to prepare fresh verification links for your account.
            </div>
            <div className="flex gap-3">
              <Link href="/login" className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition">
                Sign in
              </Link>
              <Link href="/register" className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
                Create account
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-gray-900">Email verification</div>
                  <div className="text-sm text-gray-500">{session.user.email}</div>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${session.user.emailVerified ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                  {session.user.emailVerified ? "Verified" : "Pending"}
                </span>
              </div>
              {!session.user.emailVerified ? (
                <button
                  type="button"
                  onClick={() => requestVerification("email")}
                  disabled={isWorking}
                  className="mt-4 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition disabled:opacity-60"
                >
                  Send email verification link
                </button>
              ) : null}
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-gray-900">Phone verification</div>
                  <div className="text-sm text-gray-500">{session.user.emailVerified ? "Your phone can receive secure WhatsApp verification links." : "Confirm your phone for recovery and WhatsApp trust signals."}</div>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${session.user.phoneVerified ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                  {session.user.phoneVerified ? "Verified" : "Pending"}
                </span>
              </div>
              {!session.user.phoneVerified ? (
                <button
                  type="button"
                  onClick={() => requestVerification("phone")}
                  disabled={isWorking}
                  className="mt-4 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition disabled:opacity-60"
                >
                  Send phone verification link
                </button>
              ) : null}
            </div>
          </div>
        )}

        <div className="text-center text-sm text-gray-500">
          <Link href="/dashboard" className="text-emerald-600 font-medium hover:underline">
            Return to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-amber-50 px-4 text-sm font-medium text-gray-600">Loading verification...</div>}>
      <VerifyPageContent />
    </Suspense>
  );
}
