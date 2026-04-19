"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-black/10 bg-white/85 px-4 py-3 text-sm font-medium text-slate-800 shadow-sm hover:bg-white"
    >
      <LogOut className="h-4 w-4" />
      Sign Out
    </button>
  );
}
