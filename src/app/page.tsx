import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BadgeDollarSign,
  CheckCircle2,
  CreditCard,
  Landmark,
  MessageCircleMore,
  PackageCheck,
  ShieldCheck,
  Store,
  Truck,
} from "lucide-react";

const features = [
  {
    icon: MessageCircleMore,
    title: "WhatsApp-led ordering",
    description:
      "Let buyers discover products, request quotes, and place orders from chat while MaliLink keeps the operational record clean.",
  },
  {
    icon: PackageCheck,
    title: "Trade workflow visibility",
    description:
      "Track progress from product discovery to customs and delivery with a single operating view for importers and suppliers.",
  },
  {
    icon: Landmark,
    title: "TZS-first finance views",
    description:
      "Keep revenue, payables, and credit exposure legible in Tanzanian shillings even when upstream trade is quoted in USD.",
  },
  {
    icon: CreditCard,
    title: "Mobile-money collections",
    description:
      "Follow M-Pesa and other payment activity in one system, from buyer checkout to final reconciliation.",
  },
  {
    icon: Store,
    title: "Verified supplier network",
    description:
      "Surface trusted supplier listings, ratings, and inventory so buyers can move faster with more confidence.",
  },
  {
    icon: ShieldCheck,
    title: "Role-aware controls",
    description:
      "Importers, suppliers, and admins each get the tools and visibility they need without clutter or duplicated work.",
  },
];

const proofPoints = [
  { value: "TZS-first", label: "financial reporting across the product" },
  { value: "24/7", label: "buyer ordering through WhatsApp" },
  { value: "Multi-role", label: "views for importers, suppliers, and admins" },
  { value: "Kariakoo", label: "operations model built around real trade flow" },
];

const operationsPillars = [
  "Buyer places an order through WhatsApp or the web dashboard",
  "Supplier confirms quantity, MOQ, and shipment readiness",
  "Payments and credit exposure update in the same operating system",
  "Customs, delivery, and completion status stay visible end to end",
];

const pricingTiers = [
  {
    name: "Starter",
    price: "$9",
    period: "/mo",
    summary: "For small traders replacing notebooks and chats with one system.",
    features: ["Up to 10 orders per month", "WhatsApp ordering", "Basic supplier browsing", "Core reporting"],
  },
  {
    name: "Business",
    price: "$27",
    period: "/mo",
    summary: "For growing operators who need credit, payments, and deeper order visibility.",
    features: [
      "Unlimited orders",
      "Credit tracking",
      "Payment monitoring",
      "Priority support",
      "Advanced operational analytics",
    ],
    featured: true,
  },
  {
    name: "Enterprise",
    price: "$79",
    period: "/mo",
    summary: "For larger trade teams coordinating multiple users and partner workflows.",
    features: ["Multi-user access", "Operational oversight", "Integration support", "Custom workflow setup"],
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-black/5 bg-[#faf6ee]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-sm font-bold text-white">
              ML
            </div>
            <div>
              <div className="font-[var(--font-display)] text-xl font-bold tracking-[-0.05em] text-emerald-800">
                MaliLink
              </div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--muted-soft)]">
                Trade Operating System
              </div>
            </div>
          </div>

          <nav className="hidden items-center gap-6 text-sm font-medium text-[color:var(--muted)] lg:flex">
            <a href="#platform" className="hover:text-slate-950">
              Platform
            </a>
            <a href="#workflow" className="hover:text-slate-950">
              Workflow
            </a>
            <a href="#pricing" className="hover:text-slate-950">
              Pricing
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden text-sm font-medium text-[color:var(--muted)] hover:text-slate-950 sm:inline-flex">
              Sign In
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:-translate-y-0.5 hover:bg-emerald-800"
            >
              Launch MaliLink
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden px-5 pb-14 pt-10 sm:px-6 sm:pt-14">
          <div className="hero-orb -left-10 top-16 h-40 w-40 bg-amber-200/80" />
          <div className="hero-orb right-8 top-6 h-56 w-56 bg-emerald-200/70" />
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.1fr,0.9fr] lg:items-center">
            <div className="relative">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50/85 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                <BarChart3 className="h-3.5 w-3.5" />
                Built for Kariakoo wholesalers
              </div>
              <h1 className="max-w-3xl font-[var(--font-display)] text-5xl font-bold tracking-[-0.065em] text-slate-950 sm:text-6xl lg:text-7xl">
                Move your import business from scattered chats to one trade command center.
              </h1>
              <p className="mt-6 max-w-2xl text-balance text-lg leading-8 text-[color:var(--muted)] sm:text-xl">
                MaliLink connects suppliers, importers, payments, and credit tracking in a workflow designed for East African trade teams that already live in WhatsApp.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-700 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-emerald-900/15 hover:-translate-y-0.5 hover:bg-emerald-800"
                >
                  Start free trial
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="#workflow"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-black/10 bg-white/80 px-6 py-3.5 text-base font-semibold text-slate-900 shadow-sm hover:bg-white"
                >
                  See the workflow
                </a>
              </div>

              <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {proofPoints.map((item) => (
                  <div key={item.label} className="surface-card rounded-[1.5rem] px-4 py-4">
                    <div className="font-[var(--font-display)] text-2xl font-bold tracking-[-0.04em] text-slate-950">
                      {item.value}
                    </div>
                    <div className="mt-1 text-xs leading-5 text-[color:var(--muted)]">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="surface-card-strong relative overflow-hidden rounded-[2rem] p-4 sm:p-5">
              <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-r from-emerald-600 via-emerald-500 to-amber-400 opacity-90" />
              <div className="relative rounded-[1.5rem] bg-[#f7f2e8] p-4 pt-24 shadow-inner">
                <div className="mb-4 grid grid-cols-2 gap-3">
                  <div className="rounded-[1.25rem] bg-slate-950 p-4 text-white">
                    <div className="text-[11px] uppercase tracking-[0.2em] text-white/65">Orders in motion</div>
                    <div className="mt-3 font-[var(--font-display)] text-3xl font-bold">148</div>
                    <div className="mt-1 text-xs text-white/70">Across importer and supplier workspaces</div>
                  </div>
                  <div className="rounded-[1.25rem] bg-white p-4 shadow-sm">
                    <div className="text-[11px] uppercase tracking-[0.2em] text-[color:var(--muted-soft)]">
                      Outstanding credit
                    </div>
                    <div className="mt-3 font-[var(--font-display)] text-3xl font-bold text-slate-950">
                      TZS 42.6M
                    </div>
                    <div className="mt-1 text-xs text-[color:var(--muted)]">Visible without switching systems</div>
                  </div>
                </div>

                <div className="rounded-[1.5rem] bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between gap-4 border-b border-black/5 pb-3">
                    <div>
                      <div className="text-sm font-semibold text-slate-950">WhatsApp live order</div>
                      <div className="text-xs text-[color:var(--muted)]">Buyer flow mirrored in dashboard</div>
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
                      <MessageCircleMore className="h-3.5 w-3.5" />
                      Sync active
                    </div>
                  </div>

                  <div className="space-y-3 py-4">
                    <div className="max-w-[82%] rounded-2xl rounded-bl-md bg-[#ece6dd] px-4 py-3 text-sm text-slate-800">
                      Karibu. Type the product you need or choose:
                      <div className="mt-2 text-xs text-[color:var(--muted)]">Search, Browse, New order, Order status</div>
                    </div>
                    <div className="ml-auto max-w-[70%] rounded-2xl rounded-br-md bg-emerald-600 px-4 py-3 text-sm text-white shadow-sm">
                      Need 65W USB-C chargers, MOQ 100.
                    </div>
                    <div className="max-w-[86%] rounded-2xl rounded-bl-md bg-[#ece6dd] px-4 py-3 text-sm text-slate-800">
                      Supplier found: Guangzhou Electronics
                      <div className="mt-2 text-xs text-[color:var(--muted)]">
                        TZS-first estimate, supplier, and order draft sent to MaliLink dashboard
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl bg-emerald-50 p-3">
                      <div className="text-[11px] uppercase tracking-[0.18em] text-emerald-700">Settlement</div>
                      <div className="mt-1 text-sm font-semibold text-slate-950">M-Pesa tracked</div>
                    </div>
                    <div className="rounded-2xl bg-amber-50 p-3">
                      <div className="text-[11px] uppercase tracking-[0.18em] text-amber-700">Customs</div>
                      <div className="mt-1 text-sm font-semibold text-slate-950">Status visible</div>
                    </div>
                    <div className="rounded-2xl bg-slate-100 p-3">
                      <div className="text-[11px] uppercase tracking-[0.18em] text-slate-700">Counterparty</div>
                      <div className="mt-1 text-sm font-semibold text-slate-950">Supplier verified</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="platform" className="px-5 py-14 sm:px-6">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-700">Platform capabilities</p>
                <h2 className="mt-3 font-[var(--font-display)] text-4xl font-bold tracking-[-0.05em] text-slate-950">
                  Built around the way trade teams already work.
                </h2>
              </div>
              <p className="max-w-2xl text-base leading-7 text-[color:var(--muted)]">
                The product is strongest when it reduces channel-switching. That means messaging, supplier discovery,
                order tracking, finance, and admin oversight all need to feel connected.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {features.map((feature) => {
                const Icon = feature.icon;

                return (
                  <div key={feature.title} className="surface-card rounded-[1.75rem] p-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-5 font-[var(--font-display)] text-2xl font-semibold tracking-[-0.04em] text-slate-950">
                      {feature.title}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section id="workflow" className="px-5 py-14 sm:px-6">
          <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.95fr,1.05fr]">
            <div className="surface-card-strong rounded-[2rem] p-6 sm:p-7">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-700">Operational flow</p>
              <h2 className="mt-3 font-[var(--font-display)] text-4xl font-bold tracking-[-0.05em] text-slate-950">
                Trade progress should be visible in one pass.
              </h2>
              <p className="mt-4 max-w-xl text-base leading-7 text-[color:var(--muted)]">
                When the team can see demand, financing, and delivery status together, fewer things slip through chats,
                notebooks, or separate spreadsheets.
              </p>

              <div className="mt-8 space-y-4">
                {operationsPillars.map((item, index) => (
                  <div key={item} className="flex items-start gap-4 rounded-[1.5rem] border border-black/5 bg-white/80 p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-sm font-semibold text-white">
                      {index + 1}
                    </div>
                    <p className="pt-1 text-sm leading-7 text-[color:var(--muted)]">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4">
              <div className="surface-card rounded-[1.75rem] p-6">
                <div className="flex items-center gap-3">
                  <BadgeDollarSign className="h-5 w-5 text-emerald-700" />
                  <div className="font-[var(--font-display)] text-xl font-semibold text-slate-950">
                    Finance stays close to operations
                  </div>
                </div>
                <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">
                  Credit exposure, pending collections, and settled payments belong next to the orders that created them.
                </p>
              </div>

              <div className="surface-card rounded-[1.75rem] p-6">
                <div className="flex items-center gap-3">
                  <Truck className="h-5 w-5 text-amber-700" />
                  <div className="font-[var(--font-display)] text-xl font-semibold text-slate-950">
                    Shipment and customs visibility
                  </div>
                </div>
                <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">
                  Operators need more than a final delivery status. The journey between confirmation, shipping, customs,
                  and completion should stay legible.
                </p>
              </div>

              <div className="surface-card rounded-[1.75rem] p-6">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-slate-900" />
                  <div className="font-[var(--font-display)] text-xl font-semibold text-slate-950">
                    Trusted counterparties
                  </div>
                </div>
                <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">
                  Supplier verification, ratings, and active listing tiers help buyers move faster without losing confidence.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="pricing" className="px-5 py-14 sm:px-6">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-700">Pricing</p>
              <h2 className="mt-3 font-[var(--font-display)] text-4xl font-bold tracking-[-0.05em] text-slate-950">
                Start lean, then add operational depth.
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[color:var(--muted)]">
                Subscription planning is shown in USD, while the product experience itself remains centered on Tanzanian shillings.
              </p>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              {pricingTiers.map((tier) => (
                <div
                  key={tier.name}
                  className={`surface-card relative rounded-[1.9rem] p-6 ${
                    tier.featured ? "border-emerald-300 bg-emerald-950 text-white" : ""
                  }`}
                >
                  {tier.featured ? (
                    <div className="mb-5 inline-flex rounded-full bg-white/12 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
                      Most practical for growing teams
                    </div>
                  ) : null}
                  <div className={`font-[var(--font-display)] text-2xl font-semibold ${tier.featured ? "text-white" : "text-slate-950"}`}>
                    {tier.name}
                  </div>
                  <p className={`mt-3 text-sm leading-7 ${tier.featured ? "text-white/78" : "text-[color:var(--muted)]"}`}>
                    {tier.summary}
                  </p>
                  <div className="mt-5 flex items-end gap-1">
                    <span className={`font-[var(--font-display)] text-5xl font-bold tracking-[-0.05em] ${tier.featured ? "text-white" : "text-slate-950"}`}>
                      {tier.price}
                    </span>
                    <span className={`pb-1 text-sm ${tier.featured ? "text-white/78" : "text-[color:var(--muted)]"}`}>{tier.period}</span>
                  </div>

                  <div className="mt-6 space-y-3">
                    {tier.features.map((feature) => (
                      <div key={feature} className="flex items-start gap-3">
                        <CheckCircle2 className={`mt-0.5 h-4.5 w-4.5 shrink-0 ${tier.featured ? "text-emerald-200" : "text-emerald-700"}`} />
                        <span className={`text-sm leading-6 ${tier.featured ? "text-white/88" : "text-[color:var(--muted)]"}`}>
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>

                  <Link
                    href="/register"
                    className={`mt-8 inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold ${
                      tier.featured
                        ? "bg-white text-slate-950 hover:bg-[#fff7ea]"
                        : "bg-slate-950 text-white hover:bg-emerald-800"
                    }`}
                  >
                    Get started
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-5 pb-16 pt-6 sm:px-6">
          <div className="surface-card-strong mx-auto flex max-w-7xl flex-col gap-6 rounded-[2.25rem] px-6 py-8 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-700">Next step</p>
              <h2 className="mt-3 font-[var(--font-display)] text-4xl font-bold tracking-[-0.05em] text-slate-950">
                Bring your buyers, suppliers, and payments into the same system.
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-[color:var(--muted)]">
                MaliLink works best when the team stops treating operations as separate threads and starts running them like one coordinated pipeline.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-700 px-6 py-3.5 text-sm font-semibold text-white hover:bg-emerald-800"
              >
                Create account
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-2xl border border-black/10 bg-white px-6 py-3.5 text-sm font-semibold text-slate-900 hover:bg-[#fffaf3]"
              >
                Open dashboard
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
