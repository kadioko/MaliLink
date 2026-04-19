import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { UserRole } from "@prisma/client";
import { ShieldCheck } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { Badge } from "@/components/dashboard-ui";
import { SessionMonitor } from "@/components/session-monitor";
import { getInitials } from "@/lib/utils";
import { DesktopDashboardNav } from "./desktop-dashboard-nav";
import { MobileDashboardNav } from "./mobile-dashboard-nav";
import { SignOutButton } from "./sign-out-button";

type NavItem = {
  href: string;
  label: string;
  icon: "dashboard" | "orders" | "suppliers" | "payments" | "credit" | "products";
};

const dashboardNavItems: Record<UserRole, NavItem[]> = {
  IMPORTER: [
    { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
    { href: "/orders", label: "Orders", icon: "orders" },
    { href: "/suppliers", label: "Suppliers", icon: "suppliers" },
    { href: "/payments", label: "Payments", icon: "payments" },
    { href: "/credit", label: "Credit", icon: "credit" },
  ],
  SUPPLIER: [
    { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
    { href: "/products", label: "Products", icon: "products" },
    { href: "/orders", label: "Orders", icon: "orders" },
    { href: "/payments", label: "Payments", icon: "payments" },
    { href: "/credit", label: "Credit", icon: "credit" },
  ],
  ADMIN: [
    { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
    { href: "/orders", label: "Orders", icon: "orders" },
    { href: "/products", label: "Products", icon: "products" },
    { href: "/suppliers", label: "Suppliers", icon: "suppliers" },
    { href: "/payments", label: "Payments", icon: "payments" },
    { href: "/credit", label: "Credit", icon: "credit" },
  ],
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login?callbackUrl=/dashboard");
  }

  const navItems = dashboardNavItems[session.user.role];

  return (
    <div className="min-h-screen bg-transparent lg:flex">
      <SessionMonitor />
      <MobileDashboardNav items={navItems} businessName={session.user.businessName} role={session.user.role} />
      <aside className="hidden w-80 px-4 py-4 lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col">
        <div className="surface-card-strong flex h-full flex-col overflow-hidden rounded-[2rem]">
          <div className="border-b border-black/5 px-6 pb-5 pt-6">
            <Link href="/dashboard" className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-sm font-bold text-white shadow-sm">
                ML
              </div>
              <div>
                <div className="font-[var(--font-display)] text-2xl font-bold tracking-[-0.05em] text-emerald-800">
                  MaliLink
                </div>
                <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted-soft)]">
                  Kariakoo Trade Hub
                </p>
              </div>
            </Link>
          </div>

          <div className="px-6 pt-5">
            <div className="rounded-[1.5rem] bg-slate-950 p-4 text-white">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/12 font-semibold">
                  {getInitials(session.user.businessName)}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-medium">{session.user.businessName}</p>
                  <p className="truncate text-xs text-white/70">{session.user.email}</p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Badge tone="success">{session.user.role}</Badge>
                <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/80">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Secure Access
                </span>
              </div>
            </div>
          </div>
          <DesktopDashboardNav items={navItems} />

          <div className="mt-auto border-t border-black/5 px-6 py-5">
            <div className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50/80 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">WhatsApp Layer</p>
              <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">
                Orders from chat still flow into your core trade workflow with shared visibility across teams.
              </p>
            </div>
            <div className="mt-4">
              <SignOutButton />
            </div>
          </div>
        </div>
      </aside>

      <main className="min-w-0 flex-1 overflow-auto">
        {!session.user.emailVerified || !session.user.phoneVerified ? (
          <div className="px-4 pt-4 sm:px-6">
            <div className="surface-card mx-auto max-w-7xl rounded-[1.75rem] border-amber-200 bg-amber-50/90 px-5 py-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-amber-900">Verify your account details</p>
                  <p className="text-sm text-amber-800">
                    {!session.user.emailVerified && !session.user.phoneVerified
                      ? "Email and phone verification are still pending."
                      : !session.user.emailVerified
                        ? "Email verification is still pending."
                        : "Phone verification is still pending."}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {!session.user.emailVerified ? (
                    <Link
                      href="/verify"
                      className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800"
                    >
                      Verify email
                    </Link>
                  ) : null}
                  {!session.user.phoneVerified ? (
                    <Link
                      href="/verify"
                      className="rounded-xl border border-emerald-300 bg-white px-4 py-2 text-sm font-medium text-emerald-800 hover:bg-emerald-50"
                    >
                      Verify phone
                    </Link>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        ) : null}
        {children}
      </main>
    </div>
  );
}
