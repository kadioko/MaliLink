const PAYMENT_METHODS = [
  { id: "MPESA", label: "M-Pesa", icon: "📱" },
  { id: "TIGO_PESA", label: "Tigo Pesa", icon: "📱" },
  { id: "AIRTEL_MONEY", label: "Airtel Money", icon: "📱" },
  { id: "BANK_TRANSFER", label: "Bank Transfer", icon: "🏦" },
  { id: "CASH", label: "Cash", icon: "💵" },
];

export default function PaymentsPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Payments</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payment Summary */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-4 shadow-sm border">
              <div className="text-sm text-gray-500">Total Paid</div>
              <div className="text-xl font-bold text-gray-900">$0</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border">
              <div className="text-sm text-gray-500">Pending</div>
              <div className="text-xl font-bold text-amber-600">$0</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border">
              <div className="text-sm text-gray-500">Platform Fees</div>
              <div className="text-xl font-bold text-gray-900">$0</div>
            </div>
          </div>

          {/* Payment History */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="px-4 py-3 border-b bg-gray-50">
              <h2 className="font-semibold text-gray-700">Payment History</h2>
            </div>
            <div className="py-12 text-center text-gray-400">
              <div className="text-3xl mb-2">💳</div>
              <p>No payments recorded yet</p>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <h2 className="font-semibold text-gray-700 mb-4">Payment Methods</h2>
          <div className="space-y-3">
            {PAYMENT_METHODS.map((method) => (
              <div
                key={method.id}
                className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-emerald-300 cursor-pointer transition"
              >
                <span className="text-xl">{method.icon}</span>
                <span className="font-medium text-gray-700">{method.label}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-4">
            1.5% transaction fee applies. Mobile money payments are processed in real-time.
          </p>
        </div>
      </div>
    </div>
  );
}
