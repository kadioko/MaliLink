const LISTING_TIERS = [
  { tier: "FREE", label: "Free", color: "text-gray-600", bg: "bg-gray-100" },
  { tier: "BASIC", label: "Basic", color: "text-blue-600", bg: "bg-blue-100" },
  { tier: "PREMIUM", label: "Premium", color: "text-purple-600", bg: "bg-purple-100" },
  { tier: "FEATURED", label: "Featured", color: "text-amber-600", bg: "bg-amber-100" },
];

export default function SuppliersPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Supplier Directory</h1>
        <div className="flex gap-2">
          <input
            type="search"
            placeholder="Search suppliers..."
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 w-64"
          />
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500">
            <option value="">All Categories</option>
            <option value="electronics">Electronics</option>
            <option value="textiles">Textiles & Clothing</option>
            <option value="machinery">Machinery</option>
            <option value="building">Building Materials</option>
            <option value="auto">Auto Parts</option>
            <option value="household">Household Goods</option>
          </select>
        </div>
      </div>

      {/* Tier Filter */}
      <div className="flex gap-2 mb-6">
        <button className="px-4 py-2 rounded-full text-sm font-medium bg-emerald-100 text-emerald-700 border border-emerald-300">
          All
        </button>
        {LISTING_TIERS.map((t) => (
          <button
            key={t.tier}
            className={`px-4 py-2 rounded-full text-sm font-medium ${t.bg} ${t.color} border border-transparent hover:border-gray-300 transition`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Supplier Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Empty state */}
        <div className="col-span-full py-16 text-center text-gray-400">
          <div className="text-4xl mb-3">🏭</div>
          <p className="font-medium text-gray-600">No suppliers listed yet</p>
          <p className="text-sm mt-1">Be the first supplier on MaliLink.</p>
        </div>
      </div>

      {/* Become a Supplier CTA */}
      <div className="mt-8 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Are you a supplier?</h3>
            <p className="text-purple-100 mt-1">
              List your products on MaliLink and reach thousands of Kariakoo importers.
              Paid listings get priority placement and more visibility.
            </p>
            <div className="flex gap-3 mt-4">
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Free: Basic listing</span>
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Basic: $15/mo</span>
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Premium: $45/mo</span>
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Featured: $99/mo</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
