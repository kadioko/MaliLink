import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Badge } from "@/components/dashboard-ui";
import { MobileDashboardNav } from "./mobile-dashboard-nav";
import { SignOutButton } from "./sign-out-button";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/orders", label: "Orders", icon: "📦" },
  { href: "/products", label: "Products", icon: "🏪" },
  { href: "/suppliers", label: "Suppliers", icon: "🏭" },
  { href: "/payments", label: "Payments", icon: "💳" },
  { href: "/credit", label: "Credit", icon: "🏦" },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login?callbackUrl=/dashboard");
  }

  return (
    <div className="min-h-screen bg-gray-50 lg:flex">
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

      <main className="min-w-0 flex-1 overflow-auto">{children}</main>
    </div>
  );
}
