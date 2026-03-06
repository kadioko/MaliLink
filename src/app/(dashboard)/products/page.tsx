const CATEGORIES = [
  "All", "Electronics", "Textiles & Clothing", "Machinery",
  "Building Materials", "Auto Parts", "Household Goods",
  "Food & Beverages", "Cosmetics",
];

export default function ProductsPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Product Catalog</h1>
        <div className="flex gap-2">
          <input
            type="search"
            placeholder="Search products..."
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 w-64"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap bg-white border border-gray-200 text-gray-700 hover:bg-emerald-50 hover:border-emerald-300 transition"
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {/* Empty state */}
        <div className="col-span-full py-16 text-center text-gray-400">
          <div className="text-4xl mb-3">🏪</div>
          <p className="font-medium text-gray-600">No products listed yet</p>
          <p className="text-sm mt-1">Suppliers can add products from their dashboard.</p>
        </div>
      </div>
    </div>
  );
}
