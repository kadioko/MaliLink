"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

type MobileDashboardNavProps = {
  items: Array<{ href: string; label: string; icon: string }>;
  businessName: string;
  role: string;
};

export function MobileDashboardNav({ items, businessName, role }: MobileDashboardNavProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-lg font-bold text-emerald-700">MaliLink</div>
            <div className="text-xs text-gray-500">{businessName}</div>
          </div>
          <button
            type="button"
            onClick={() => setOpen((current) => !current)}
            className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700"
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </div>

      {open ? (
        <div className="fixed inset-0 z-40 bg-black/30 lg:hidden" onClick={() => setOpen(false)}>
          <div
            className="ml-auto flex h-full w-[82%] max-w-sm flex-col bg-white shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="border-b border-gray-200 p-4">
              <div className="text-lg font-bold text-emerald-700">MaliLink</div>
              <div className="mt-1 text-sm font-medium text-gray-900">{businessName}</div>
              <div className="mt-1 text-xs text-emerald-700">Role: {role}</div>
            </div>
            <nav className="flex-1 space-y-2 p-4">
              {items.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                      active ? "bg-emerald-50 text-emerald-700" : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      ) : null}
    </>
  );
}
