"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BriefcaseBusiness,
  CreditCard,
  LayoutDashboard,
  Menu,
  Package,
  Settings,
  ShieldCheck,
  Store,
  Truck,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { getInitials } from "@/lib/utils";
import { NotificationsBell } from "@/components/notifications-bell";
import { SignOutButton } from "./sign-out-button";

type MobileDashboardNavProps = {
  items: Array<{
    href: string;
    label: string;
    icon: "dashboard" | "orders" | "suppliers" | "payments" | "credit" | "products" | "settings" | "supplier-profile" | "admin-users";
  }>;
  businessName: string;
  role: string;
};

const iconMap = {
  dashboard: LayoutDashboard,
  orders: Truck,
  suppliers: BriefcaseBusiness,
  payments: CreditCard,
  credit: Wallet,
  products: Package,
  settings: Settings,
  "supplier-profile": Store,
  "admin-users": Users,
} as const;

export function MobileDashboardNav({ items, businessName, role }: MobileDashboardNavProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="sticky top-0 z-30 border-b border-black/5 bg-[#faf6ee]/90 px-4 py-3 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-sm font-bold text-white">
              {getInitials(businessName)}
            </div>
            <div className="min-w-0">
              <div className="font-[var(--font-display)] text-lg font-bold tracking-[-0.04em] text-emerald-800">
                MaliLink
              </div>
              <div className="truncate text-xs text-[color:var(--muted)]">{businessName}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <NotificationsBell />
            <button
              type="button"
              onClick={() => setOpen((current) => !current)}
              className="inline-flex items-center gap-2 rounded-2xl border border-black/10 bg-white/80 px-3 py-2 text-sm font-medium text-slate-800 shadow-sm"
            >
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              {open ? "Close" : "Menu"}
            </button>
          </div>
        </div>
      </div>

      {open ? (
        <div className="fixed inset-0 z-40 bg-slate-950/35 lg:hidden" onClick={() => setOpen(false)}>
          <div
            className="ml-auto flex h-full w-[88%] max-w-sm flex-col bg-[#f8f3ea] shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="border-b border-black/5 px-5 pb-5 pt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 font-semibold text-white">
                  {getInitials(businessName)}
                </div>
                <div className="min-w-0">
                  <div className="truncate font-[var(--font-display)] text-xl font-bold text-slate-950">
                    {businessName}
                  </div>
                  <div className="mt-1 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    {role}
                  </div>
                </div>
              </div>
            </div>
            <nav className="flex-1 space-y-2 px-4 py-5">
              {items.map((item) => {
                const active = pathname === item.href;
                const Icon = iconMap[item.icon];

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                      active
                        ? "bg-slate-950 text-white shadow-sm"
                        : "bg-white/65 text-slate-700 hover:bg-white hover:text-slate-950"
                    }`}
                  >
                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-2xl ${
                        active ? "bg-white/12 text-white" : "bg-emerald-50 text-emerald-700"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
            <div className="border-t border-black/5 px-4 py-4">
              <SignOutButton />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
