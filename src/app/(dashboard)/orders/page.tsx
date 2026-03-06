import Link from "next/link";

const ORDER_STATUSES = [
  { value: "all", label: "All Orders" },
  { value: "SUBMITTED", label: "Submitted" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "PROCESSING", label: "Processing" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "IN_CUSTOMS", label: "In Customs" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "COMPLETED", label: "Completed" },
];

export default function OrdersPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <Link
          href="/orders?new=1"
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition"
        >
          + New Order
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {ORDER_STATUSES.map((status) => (
          <button
            key={status.value}
            className="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap bg-white border border-gray-200 text-gray-700 hover:bg-emerald-50 hover:border-emerald-300 transition"
          >
            {status.label}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Order #</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Supplier</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Items</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Total</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Source</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Date</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={8} className="py-16 text-center text-gray-400">
                <div className="text-4xl mb-3">📦</div>
                <p className="font-medium text-gray-600">No orders yet</p>
                <p className="text-sm mt-1">Place your first order or browse suppliers to get started.</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
