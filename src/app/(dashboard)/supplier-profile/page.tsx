"use client";

import { FormEvent, useEffect, useState } from "react";
import { redirect } from "next/navigation";
import { useSession } from "next-auth/react";
import { Globe, Package, Tag, Truck, DollarSign, CheckCircle2, AlertCircle } from "lucide-react";
import { PageHeader, SectionCard, Badge } from "@/components/dashboard-ui";

const COMMON_CATEGORIES = [
  "electronics", "mobile_phones", "accessories", "textiles", "clothing",
  "machinery", "construction", "food_beverages", "cosmetics", "household",
  "automotive", "furniture", "stationery", "medical", "agricultural",
];

type AlertState = { type: "success" | "error"; message: string } | null;

function InputField(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-60"
    />
  );
}

function TextareaField(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      rows={4}
      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-60"
    />
  );
}

export default function SupplierProfilePage() {
  const { data: session, status } = useSession();

  const [isLoading, setIsLoading] = useState(true);
  const [description, setDescription] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [origin, setOrigin] = useState("");
  const [minOrder, setMinOrder] = useState("");
  const [leadTimeDays, setLeadTimeDays] = useState("");
  const [alert, setAlert] = useState<AlertState>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") return;
    fetch("/api/supplier-profile")
      .then((r) => r.json())
      .then(({ listing }) => {
        if (listing) {
          setDescription(listing.description ?? "");
          setSelectedCategories(listing.categories ?? []);
          setOrigin(listing.origin ?? "");
          setMinOrder(listing.minOrder ? String(listing.minOrder) : "");
          setLeadTimeDays(listing.leadTimeDays ? String(listing.leadTimeDays) : "");
        }
      })
      .finally(() => setIsLoading(false));
  }, [status]);

  function toggleCategory(cat: string) {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setAlert(null);
    setIsSaving(true);
    try {
      const res = await fetch("/api/supplier-profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: description || undefined,
          categories: selectedCategories,
          origin: origin || undefined,
          minOrder: minOrder ? Number(minOrder) : undefined,
          leadTimeDays: leadTimeDays ? Number(leadTimeDays) : undefined,
        }),
      });
      const payload = await res.json();
      if (!res.ok) {
        setAlert({ type: "error", message: typeof payload.error === "string" ? payload.error : "Update failed." });
      } else {
        setAlert({ type: "success", message: "Supplier profile updated successfully." });
      }
    } catch {
      setAlert({ type: "error", message: "Network error — please try again." });
    } finally {
      setIsSaving(false);
    }
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6">
        <div className="h-32 animate-pulse rounded-[2rem] bg-white/60" />
        <div className="h-64 animate-pulse rounded-[1.75rem] bg-white/60" />
      </div>
    );
  }

  if (session?.user.role !== "SUPPLIER") {
    return (
      <div className="mx-auto max-w-3xl p-4 sm:p-6">
        <SectionCard title="Access Restricted" description="Supplier profile editing is only available to supplier accounts.">
          <p className="text-sm text-gray-500">Your current role is <strong>{session?.user.role}</strong>.</p>
        </SectionCard>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6">
      <PageHeader
        title="Supplier Profile"
        description="Customize your marketplace listing to attract importers and stand out in the directory."
        badge={<Badge tone="info">Marketplace Listing</Badge>}
      />

      <form onSubmit={handleSave} className="space-y-6">
        <SectionCard title="Listing Description" description="Tell importers about your business, specialties, and quality standards.">
          <TextareaField
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Leading electronics and accessories supplier based in Guangzhou. 10+ years experience with Tanzanian importers. MOQ negotiable."
          />
        </SectionCard>

        <SectionCard title="Product Categories" description="Select all categories that apply to your catalog. This helps importers find you.">
          <div className="flex flex-wrap gap-2">
            {COMMON_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => toggleCategory(cat)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                  selectedCategories.includes(cat)
                    ? "border-emerald-500 bg-emerald-500 text-white"
                    : "border-gray-200 bg-white text-gray-600 hover:border-emerald-300 hover:text-emerald-700"
                }`}
              >
                {cat.replace(/_/g, " ")}
              </button>
            ))}
          </div>
          {selectedCategories.length > 0 ? (
            <p className="mt-3 text-xs text-gray-500">{selectedCategories.length} categor{selectedCategories.length === 1 ? "y" : "ies"} selected</p>
          ) : null}
        </SectionCard>

        <SectionCard title="Logistics Details" description="Trade terms visible to buyers browsing your listing.">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-gray-700">
                <Globe className="h-3.5 w-3.5 text-gray-400" />
                Origin / Source Region
              </label>
              <InputField
                type="text"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                placeholder="e.g. Guangzhou, China"
              />
            </div>
            <div>
              <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-gray-700">
                <DollarSign className="h-3.5 w-3.5 text-gray-400" />
                Minimum Order (USD)
              </label>
              <InputField
                type="number"
                value={minOrder}
                onChange={(e) => setMinOrder(e.target.value)}
                placeholder="e.g. 500"
                min={1}
                step={1}
              />
            </div>
            <div>
              <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-gray-700">
                <Truck className="h-3.5 w-3.5 text-gray-400" />
                Lead Time (days)
              </label>
              <InputField
                type="number"
                value={leadTimeDays}
                onChange={(e) => setLeadTimeDays(e.target.value)}
                placeholder="e.g. 14"
                min={1}
                step={1}
              />
            </div>
          </div>
        </SectionCard>

        {alert ? (
          <div className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm ${alert.type === "success" ? "border border-emerald-200 bg-emerald-50 text-emerald-800" : "border border-red-200 bg-red-50 text-red-700"}`}>
            {alert.type === "success" ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
            {alert.message}
          </div>
        ) : null}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isSaving}
            className="rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
          >
            {isSaving ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </form>
    </div>
  );
}
