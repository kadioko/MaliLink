import Link from "next/link";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/orders", label: "Orders", icon: "📦" },
  { href: "/products", label: "Products", icon: "🏪" },
  { href: "/suppliers", label: "Suppliers", icon: "🏭" },
  { href: "/payments", label: "Payments", icon: "💳" },
  { href: "/credit", label: "Credit", icon: "🏦" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-emerald-700">MaliLink</span>
          </Link>
          <p className="text-xs text-gray-400 mt-1">Kariakoo Trade Hub</p>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition"
            >
              <span>{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t">
          <div className="px-3 py-2 bg-emerald-50 rounded-lg">
            <p className="text-xs text-emerald-600 font-medium">WhatsApp Bot Active</p>
            <p className="text-xs text-gray-500 mt-1">Buyers can order via WhatsApp</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-gray-50 overflow-auto">{children}</main>
    </div>
  );
}
