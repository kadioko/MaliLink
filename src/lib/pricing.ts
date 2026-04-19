import { DEFAULT_USD_TO_TZS_RATE } from "./constants";

export type SupportedCurrencyCode = "TZS" | "USD";

export type PricingTier = {
  name: string;
  priceTzs: number;
  period: "/mo";
  summary: string;
  features: string[];
  featured?: boolean;
};

export const BILLING_CURRENCIES: Array<{
  code: SupportedCurrencyCode;
  label: string;
  description: string;
}> = [
  {
    code: "TZS",
    label: "TZS",
    description: "Recommended for Tanzania",
  },
  {
    code: "USD",
    label: "USD",
    description: "For teams that prefer dollar planning",
  },
];

export const LANDING_PRICING_TIERS: PricingTier[] = [
  {
    name: "Starter",
    priceTzs: 29000,
    period: "/mo",
    summary: "For small traders replacing notebooks and chats with one system.",
    features: ["Up to 10 orders per month", "WhatsApp ordering", "Basic supplier browsing", "Core reporting"],
  },
  {
    name: "Business",
    priceTzs: 79000,
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
    priceTzs: 249000,
    period: "/mo",
    summary: "For larger trade teams coordinating multiple users and partner workflows.",
    features: ["Multi-user access", "Operational oversight", "Integration support", "Custom workflow setup"],
  },
];

export function formatPricingAmount(amountTzs: number, currency: SupportedCurrencyCode): string {
  if (currency === "TZS") {
    return new Intl.NumberFormat("en-TZ", {
      style: "currency",
      currency: "TZS",
      maximumFractionDigits: 0,
    }).format(amountTzs);
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amountTzs / DEFAULT_USD_TO_TZS_RATE);
}

export function getPricingExchangeHint(currency: SupportedCurrencyCode): string | null {
  if (currency === "USD") {
    return `Converted from TZS using ~${DEFAULT_USD_TO_TZS_RATE.toLocaleString("en-US")} TZS/USD.`;
  }

  return null;
}
