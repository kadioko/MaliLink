export const PLATFORM_FEE_RATE = 0.015; // 1.5% transaction fee
export const DEFAULT_CREDIT_TERM_DAYS = 30;
export const DEFAULT_INTEREST_RATE = 0.05; // 5% monthly

export const SUBSCRIPTION_PLANS = {
  starter: {
    name: "Starter",
    priceUsd: 9,
    priceTzs: 22500,
    features: [
      "Up to 50 orders/month",
      "Basic analytics",
      "WhatsApp ordering",
      "Email support",
    ],
  },
  business: {
    name: "Business",
    priceUsd: 27,
    priceTzs: 67500,
    features: [
      "Unlimited orders",
      "Credit management",
      "Advanced analytics",
      "Priority support",
      "Supplier directory access",
      "Custom invoicing",
    ],
  },
  enterprise: {
    name: "Enterprise",
    priceUsd: 79,
    priceTzs: 197500,
    features: [
      "Everything in Business",
      "Multi-warehouse tracking",
      "API access",
      "Dedicated account manager",
      "Customs integration",
      "Bulk import tools",
    ],
  },
} as const;

export const SUPPLIER_LISTING_FEES = {
  FREE: { monthly: 0, label: "Free Listing" },
  BASIC: { monthly: 15, label: "Basic - Category visibility" },
  PREMIUM: { monthly: 45, label: "Premium - Top placement + analytics" },
  FEATURED: { monthly: 99, label: "Featured - Homepage + WhatsApp promos" },
} as const;

export const PRODUCT_CATEGORIES = [
  "Electronics",
  "Textiles & Clothing",
  "Machinery & Equipment",
  "Building Materials",
  "Auto Parts",
  "Household Goods",
  "Food & Beverages",
  "Cosmetics & Beauty",
  "Pharmaceuticals",
  "Stationery & Office",
  "Agricultural Supplies",
  "Plastics & Packaging",
] as const;

export const ORDER_STATUS_LABELS: Record<string, string> = {
  DRAFT: "Draft",
  SUBMITTED: "Submitted",
  CONFIRMED: "Confirmed",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  IN_CUSTOMS: "In Customs",
  DELIVERED: "Delivered",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  DISPUTED: "Disputed",
};
