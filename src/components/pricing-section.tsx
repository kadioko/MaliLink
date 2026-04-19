"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import {
  BILLING_CURRENCIES,
  LANDING_PRICING_TIERS,
  type SupportedCurrencyCode,
  formatPricingAmount,
  getPricingExchangeHint,
} from "@/lib/pricing";

export function PricingSection() {
  const [currency, setCurrency] = useState<SupportedCurrencyCode>("TZS");

  return (
    <section id="pricing" className="px-5 py-14 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-700">Pricing</p>
          <h2 className="mt-3 font-[var(--font-display)] text-4xl font-bold tracking-[-0.05em] text-slate-950">
            Start in TZS, switch if your team prefers USD.
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-base leading-7 text-[color:var(--muted)]">
            Pricing defaults to Tanzanian shillings for our first market. If a buyer or partner team would rather plan in
            dollars, they can switch the display without changing the underlying plan structure.
          </p>
        </div>

        <div className="mb-8 flex flex-col gap-4 rounded-[1.75rem] border border-black/5 bg-white/70 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-sm font-semibold text-slate-950">Display currency</div>
            <div className="mt-1 text-sm text-[color:var(--muted)]">
              The pricing registry is structured so we can add more currencies later if needed.
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {BILLING_CURRENCIES.map((option) => (
              <button
                key={option.code}
                type="button"
                onClick={() => setCurrency(option.code)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  currency === option.code
                    ? "bg-slate-950 text-white shadow-sm"
                    : "bg-white text-slate-700 ring-1 ring-black/10 hover:bg-[#fffaf3]"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-8 rounded-[1.5rem] bg-emerald-50/85 px-5 py-4 text-sm text-emerald-800">
          <span className="font-semibold">TZS is the default.</span> {getPricingExchangeHint(currency) ?? "USD is available as a display option for teams that do cross-border planning."}
          <div className="mt-1 text-emerald-700/90">
            Future currencies can be added through `src/lib/pricing.ts` without restructuring the pricing UI.
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {LANDING_PRICING_TIERS.map((tier) => (
            <div
              key={tier.name}
              className={`surface-card relative rounded-[1.9rem] p-6 ${
                tier.featured ? "border-emerald-300 bg-emerald-950 text-white" : ""
              }`}
            >
              {tier.featured ? (
                <div className="mb-5 inline-flex rounded-full bg-white/12 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
                  Best fit for growing traders
                </div>
              ) : null}
              <div className={`font-[var(--font-display)] text-2xl font-semibold ${tier.featured ? "text-white" : "text-slate-950"}`}>
                {tier.name}
              </div>
              <p className={`mt-3 text-sm leading-7 ${tier.featured ? "text-white/78" : "text-[color:var(--muted)]"}`}>
                {tier.summary}
              </p>
              <div className="mt-5 flex items-end gap-2">
                <span className={`font-[var(--font-display)] text-5xl font-bold tracking-[-0.05em] ${tier.featured ? "text-white" : "text-slate-950"}`}>
                  {formatPricingAmount(tier.priceTzs, currency)}
                </span>
                <span className={`pb-1 text-sm ${tier.featured ? "text-white/78" : "text-[color:var(--muted)]"}`}>{tier.period}</span>
              </div>

              <div className={`mt-2 text-xs ${tier.featured ? "text-white/70" : "text-[color:var(--muted-soft)]"}`}>
                {currency === "TZS" ? "Billed for Tanzania-first adoption" : getPricingExchangeHint(currency)}
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
  );
}
