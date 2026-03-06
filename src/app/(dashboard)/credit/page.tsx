export default function CreditPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Credit Management</h1>

      {/* Credit Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <div className="text-sm text-gray-500">Active Credit Lines</div>
          <div className="text-2xl font-bold text-gray-900">0</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <div className="text-sm text-gray-500">Total Outstanding</div>
          <div className="text-2xl font-bold text-amber-600">$0</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <div className="text-sm text-gray-500">Total Repaid</div>
          <div className="text-2xl font-bold text-emerald-600">$0</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <div className="text-sm text-gray-500">Overdue</div>
          <div className="text-2xl font-bold text-red-600">$0</div>
        </div>
      </div>

      {/* Credit Lines Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="px-4 py-3 border-b bg-gray-50 flex items-center justify-between">
          <h2 className="font-semibold text-gray-700">Credit Lines</h2>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50/50">
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Order</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Supplier</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Amount</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Paid</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Due Date</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={7} className="py-12 text-center text-gray-400">
                <div className="text-3xl mb-2">🏦</div>
                <p className="font-medium text-gray-600">No credit lines</p>
                <p className="text-sm mt-1">Credit is available when placing orders with qualifying suppliers.</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* How Credit Works */}
      <div className="mt-8 bg-emerald-50 rounded-xl p-6 border border-emerald-200">
        <h3 className="font-semibold text-emerald-800 mb-3">How Credit Works on MaliLink</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-emerald-700">
          <div>
            <strong>1. Request Credit</strong>
            <p>When placing an order, request credit terms from the supplier (typically 30-90 days).</p>
          </div>
          <div>
            <strong>2. Supplier Approves</strong>
            <p>The supplier reviews your order history and business profile before approving credit.</p>
          </div>
          <div>
            <strong>3. Repay on Time</strong>
            <p>Build your credit score by repaying on time. Better scores unlock better terms.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
