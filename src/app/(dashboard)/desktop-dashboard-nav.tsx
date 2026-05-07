"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BriefcaseBusiness,
  CreditCard,
  LayoutDashboard,
  Package,
  Settings,
  Store,
  Truck,
  Users,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";

type DesktopDashboardNavProps = {
  items: Array<{
    href: string;
    label: string;
    icon: "dashboard" | "orders" | "suppliers" | "payments" | "credit" | "products" | "settings" | "supplier-profile" | "admin-users";
  }>;
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

export function DesktopDashboardNav({ items }: DesktopDashboardNavProps) {
  const pathname = usePathname();

  return (
    <nav className="flex-1 space-y-2 px-4 py-6">
      {items.map((item) => {
        const Icon = iconMap[item.icon];
        const active = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "group flex items-center gap-3 rounded-2xl px-4 py-3 text-[15px] font-medium transition",
              active
                ? "bg-slate-950 text-white shadow-sm"
                : "text-slate-700 hover:bg-white hover:text-slate-950 hover:shadow-sm",
            )}
          >
            <span
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-2xl transition",
                active
                  ? "bg-white/12 text-white"
                  : "bg-emerald-50 text-emerald-700 group-hover:bg-slate-950 group-hover:text-white",
              )}
            >
              <Icon className="h-4.5 w-4.5" />
            </span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
