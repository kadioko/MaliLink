import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { UserRole } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { Badge } from "@/components/dashboard-ui";
import { SessionMonitor } from "@/components/session-monitor";
import { MobileDashboardNav } from "./mobile-dashboard-nav";
import { SignOutButton } from "./sign-out-button";

const dashboardNavItems: Record<UserRole, Array<{ href: string; label: string; icon: string }>> = {
  IMPORTER: [
    { href: "/dashboard", label: "Dashboard", icon: "📊" },
    { href: "/orders", label: "Orders", icon: "📦" },
    { href: "/suppliers", label: "Suppliers", icon: "🏭" },
    { href: "/payments", label: "Payments", icon: "💳" },
    { href: "/credit", label: "Credit", icon: "🏦" },
  ],
  SUPPLIER: [
    { href: "/dashboard", label: "Dashboard", icon: "📊" },
    { href: "/products", label: "Products", icon: "🏪" },
    { href: "/orders", label: "Orders", icon: "📦" },
    { href: "/payments", label: "Payments", icon: "💳" },
    { href: "/credit", label: "Credit", icon: "🏦" },
  ],
  ADMIN: [
    { href: "/dashboard", label: "Dashboard", icon: "📊" },
    { href: "/orders", label: "Orders", icon: "📦" },
    { href: "/products", label: "Products", icon: "🏪" },
    { href: "/suppliers", label: "Suppliers", icon: "🏭" },
    { href: "/payments", label: "Payments", icon: "💳" },
    { href: "/credit", label: "Credit", icon: "🏦" },
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
    <div className="min-h-screen bg-gray-50 lg:flex">
      <SessionMonitor />
      <MobileDashboardNav items={navItems} businessName={session.user.businessName} role={session.user.role} />
      <aside className="hidden w-72 border-r border-gray-200 bg-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col">
        <div className="border-b p-5">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-emerald-700">MaliLink</span>
          </Link>
          <p className="mt-1 text-xs text-gray-400">Kariakoo Trade Hub</p>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-gray-700 transition hover:bg-emerald-50 hover:text-emerald-700"
            >
              <span>{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="border-t p-4">
          <div className="mb-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4">
            <p className="text-sm font-semibold text-gray-900">{session.user.businessName}</p>
            <p className="mt-1 text-xs text-gray-500">{session.user.email}</p>
            <div className="mt-3"><Badge tone="success">{session.user.role}</Badge></div>
          </div>
          <div className="rounded-2xl bg-emerald-50 px-4 py-3">
            <p className="text-xs text-emerald-600 font-medium">WhatsApp Bot Active</p>
            <p className="mt-1 text-xs text-gray-500">Buyers can order via WhatsApp</p>
          </div>
          <div className="mt-3">
            <SignOutButton />
          </div>
        </div>
      </aside>

      <main className="min-w-0 flex-1 overflow-auto">
        {!session.user.emailVerified || !session.user.phoneVerified ? (
          <div className="border-b border-amber-200 bg-amber-50 px-4 py-3 sm:px-6">
            <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
                  <Link href="/verify" className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700">
                    Verify email
                  </Link>
                ) : null}
                {!session.user.phoneVerified ? (
                  <Link href="/verify" className="rounded-lg border border-emerald-300 bg-white px-4 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-50">
                    Verify phone
                  </Link>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}
        {children}
      </main>
    </div>
  );
}
