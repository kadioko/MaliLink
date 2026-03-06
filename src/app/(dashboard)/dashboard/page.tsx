import Link from "next/link";

const stats = [
  { label: "Total Orders", value: "—", icon: "📦" },
  { label: "Active Orders", value: "—", icon: "🔄" },
  { label: "Revenue (USD)", value: "$0", icon: "💰" },
  { label: "Pending Payments", value: "$0", icon: "⏳" },
  { label: "Active Credit", value: "$0", icon: "🏦" },
  { label: "Completed", value: "0", icon: "✅" },
];

const quickActions = [
  { label: "New Order", href: "/orders?new=1", icon: "📋" },
  { label: "Browse Suppliers", href: "/suppliers", icon: "🏪" },
  { label: "Make Payment", href: "/payments", icon: "💳" },
  { label: "View Credit", href: "/credit", icon: "🏦" },
];

export default function DashboardPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500">Welcome to MaliLink</p>
        </div>
        <Link
          href="/orders?new=1"
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition"
        >
          + New Order
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl p-4 shadow-sm border">
            <div className="text-2xl mb-2">{stat.icon}</div>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-sm text-gray-500">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {quickActions.map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md hover:border-emerald-300 transition text-center"
          >
            <div className="text-3xl mb-2">{action.icon}</div>
            <div className="font-medium text-gray-900">{action.label}</div>
          </Link>
        ))}
      </div>

      {/* Recent Orders */}
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h2>
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Order #</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Supplier</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Total</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Source</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Date</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={6} className="py-12 text-center text-gray-400">
                No orders yet. Place your first order to get started.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* WhatsApp Banner */}
      <div className="mt-8 bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Order via WhatsApp</h3>
            <p className="text-emerald-100 mt-1">
              Send &quot;Hi&quot; to our WhatsApp number to browse and order products without leaving WhatsApp.
            </p>
          </div>
          <div className="text-4xl">📱</div>
        </div>
      </div>
    </div>
  );
}
