import Link from "next/link";

const features = [
  {
    icon: "📱",
    title: "WhatsApp Ordering",
    description:
      "Buyers order through WhatsApp - no app download needed. Search products, place orders, track shipments, all from a chat.",
  },
  {
    icon: "📦",
    title: "Order Management",
    description:
      "Track orders from submission to customs clearance to delivery. Real-time status updates for both importers and suppliers.",
  },
  {
    icon: "🏦",
    title: "Credit System",
    description:
      "Suppliers extend credit to trusted importers. Built-in credit scoring, repayment tracking, and overdue management.",
  },
  {
    icon: "💳",
    title: "Mobile Payments",
    description:
      "M-Pesa, Tigo Pesa, Airtel Money integration. Pay suppliers, settle credit, and track all transactions in one place.",
  },
  {
    icon: "🏪",
    title: "Supplier Directory",
    description:
      "Verified supplier listings with ratings, reviews, and product catalogs. Find reliable suppliers from China, Dubai, India, and more.",
  },
  {
    icon: "🛃",
    title: "Import Tracking",
    description:
      "Track shipments through customs with real-time updates. Duty calculations, documentation, and clearance status.",
  },
];

const pricingTiers = [
  {
    name: "Starter",
    price: "$9",
    period: "/mo",
    description: "For small importers getting started",
    features: [
      "Up to 10 orders/month",
      "WhatsApp ordering",
      "Basic reporting",
      "M-Pesa payments",
      "Email support",
    ],
  },
  {
    name: "Business",
    price: "$27",
    period: "/mo",
    description: "For growing import businesses",
    popular: true,
    features: [
      "Unlimited orders",
      "WhatsApp ordering",
      "Credit management",
      "All payment methods",
      "Advanced analytics",
      "Priority support",
      "Customs tracking",
    ],
  },
  {
    name: "Enterprise",
    price: "$79",
    period: "/mo",
    description: "For large-scale operations",
    features: [
      "Everything in Business",
      "Multi-user access",
      "API access",
      "Custom integrations",
      "Dedicated account manager",
      "Bulk order tools",
      "White-label options",
    ],
  },
];

const stats = [
  { value: "Kariakoo", label: "Tanzania's largest market" },
  { value: "$2B+", label: "Annual import volume" },
  { value: "10,000+", label: "Active traders" },
  { value: "24/7", label: "WhatsApp ordering" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-emerald-700">MaliLink</span>
            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
              Beta
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
            <a href="#features" className="hover:text-emerald-600">Features</a>
            <a href="#pricing" className="hover:text-emerald-600">Pricing</a>
            <a href="#whatsapp" className="hover:text-emerald-600">WhatsApp</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-emerald-600">
              Sign In
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-bold leading-tight">
            Kariakoo&apos;s Import Economy,
            <br />
            <span className="text-amber-300">Digitized.</span>
          </h1>
          <p className="mt-6 text-xl text-emerald-100 max-w-2xl mx-auto">
            MaliLink connects importers and suppliers with seamless order management,
            credit tracking, and mobile payments. Your buyers order via WhatsApp - no app needed.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="px-8 py-4 bg-white text-emerald-700 rounded-xl text-lg font-semibold hover:bg-gray-50 transition"
            >
              Start Free Trial
            </Link>
            <a
              href="#whatsapp"
              className="px-8 py-4 border-2 border-white/50 text-white rounded-xl text-lg font-semibold hover:bg-white/10 transition"
            >
              See WhatsApp Demo
            </a>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b py-12">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-emerald-700">{stat.value}</div>
              <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-900">
            Everything you need to run your import business
          </h2>
          <p className="text-center text-gray-500 mt-3 max-w-xl mx-auto">
            Stop managing orders on paper and WhatsApp groups. MaliLink brings it all together.
          </p>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div key={feature.title} className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition">
                <div className="text-3xl mb-3">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900">{feature.title}</h3>
                <p className="mt-2 text-gray-500 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WhatsApp Demo */}
      <section id="whatsapp" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">
                Your buyers never need to download anything
              </h2>
              <p className="mt-4 text-gray-600">
                The WhatsApp ordering layer removes buyer friction entirely. Buyers search products,
                place orders, check status, and make payments - all from WhatsApp.
              </p>
              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold text-sm">1</span>
                  <span className="text-gray-700">Buyer sends &quot;Hi&quot; to your WhatsApp number</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold text-sm">2</span>
                  <span className="text-gray-700">Bot shows menu in English & Swahili</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold text-sm">3</span>
                  <span className="text-gray-700">Search products, see prices, place order</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold text-sm">4</span>
                  <span className="text-gray-700">Order appears in your MaliLink dashboard</span>
                </div>
              </div>
            </div>

            {/* Chat mockup */}
            <div className="bg-gray-100 rounded-2xl p-4 max-w-sm mx-auto">
              <div className="bg-emerald-700 text-white rounded-t-xl px-4 py-3 flex items-center gap-3">
                <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center font-bold text-sm">M</div>
                <div>
                  <div className="font-semibold text-sm">MaliLink Bot</div>
                  <div className="text-xs text-emerald-200">Online</div>
                </div>
              </div>
              <div className="bg-[#e5ddd5] p-3 space-y-2 rounded-b-xl min-h-[300px]">
                <div className="bg-white rounded-lg p-2 px-3 text-sm max-w-[80%] shadow-sm">
                  <p className="font-semibold text-emerald-700">MaliLink Bot</p>
                  <p>Karibu! Choose an option:</p>
                  <p className="mt-1">1. Tafuta bidhaa - Search</p>
                  <p>2. Angalia bei - Browse</p>
                  <p>3. Oda mpya - New order</p>
                  <p>4. Hali ya oda - Status</p>
                </div>
                <div className="bg-[#dcf8c6] rounded-lg p-2 px-3 text-sm max-w-[60%] ml-auto shadow-sm">
                  <p>1</p>
                </div>
                <div className="bg-white rounded-lg p-2 px-3 text-sm max-w-[80%] shadow-sm">
                  <p>Type product name to search:</p>
                </div>
                <div className="bg-[#dcf8c6] rounded-lg p-2 px-3 text-sm max-w-[60%] ml-auto shadow-sm">
                  <p>phone charger</p>
                </div>
                <div className="bg-white rounded-lg p-2 px-3 text-sm max-w-[80%] shadow-sm">
                  <p className="font-medium">Results:</p>
                  <p>1. USB-C Charger 65W</p>
                  <p className="text-gray-500">   Guangzhou Electronics</p>
                  <p className="text-gray-500">   $2.50/piece (MOQ: 100)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-900">Simple, transparent pricing</h2>
          <p className="text-center text-gray-500 mt-3">
            Plus 1.5% on transactions. Supplier listing fees separate.
          </p>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {pricingTiers.map((tier) => (
              <div
                key={tier.name}
                className={`bg-white rounded-xl p-6 shadow-sm border ${
                  tier.popular ? "border-emerald-500 ring-2 ring-emerald-500 relative" : ""
                }`}
              >
                {tier.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-xs font-medium px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                )}
                <h3 className="text-lg font-semibold text-gray-900">{tier.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{tier.description}</p>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">{tier.price}</span>
                  <span className="text-gray-500">{tier.period}</span>
                </div>
                <ul className="mt-6 space-y-3">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="text-emerald-500">&#10003;</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register"
                  className={`mt-6 block text-center py-2 rounded-lg font-medium transition ${
                    tier.popular
                      ? "bg-emerald-600 text-white hover:bg-emerald-700"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Get Started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <span className="text-xl font-bold text-white">MaliLink</span>
              <p className="mt-2 text-sm">
                Digitizing Kariakoo&apos;s import economy. Order, credit, and payment management for wholesalers.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Platform</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white">Features</a></li>
                <li><a href="#pricing" className="hover:text-white">Pricing</a></li>
                <li><a href="#whatsapp" className="hover:text-white">WhatsApp Bot</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">For Suppliers</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="/register" className="hover:text-white">List Your Products</a></li>
                <li><a href="#pricing" className="hover:text-white">Listing Plans</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Contact</h4>
              <ul className="space-y-2 text-sm">
                <li>support@malilink.co.tz</li>
                <li>+255 123 456 789</li>
                <li>Kariakoo, Dar es Salaam</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm">
            &copy; 2026 MaliLink. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
