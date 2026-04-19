"use client";

import { startTransition, useMemo, useState } from "react";
import { CheckCircle2, ImageIcon, Store, Truck } from "lucide-react";
import { useRouter } from "next/navigation";
import { formatTzs, getInitials } from "@/lib/utils";

type ProductOption = {
  id: string;
  name: string;
  category: string;
  unit: string;
  moq: number;
  priceTzs: number;
  inStock: boolean;
  imageUrls: string[];
  description: string | null;
};

type SupplierOption = {
  id: string;
  businessName: string;
  location: string | null;
  products: ProductOption[];
};

type NewOrderPanelProps = {
  suppliers: SupplierOption[];
  importerBusinessName: string;
  onOptimisticOrderCreated?: (order: {
    id: string;
    orderNumber: string;
    totalUsd: number;
    status: string;
    source: string;
    createdAt: string;
    items: Array<{ productId: string; quantity: number; product: ProductOption }>;
    supplier: { businessName: string };
    importer: { businessName: string };
  }) => void;
};

export function NewOrderPanel({ suppliers, importerBusinessName, onOptimisticOrderCreated }: NewOrderPanelProps) {
  const router = useRouter();
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>(suppliers[0]?.id ?? "");
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const selectedSupplier = useMemo(
    () => suppliers.find((supplier) => supplier.id === selectedSupplierId) ?? null,
    [selectedSupplierId, suppliers],
  );

  const selectedItems = useMemo(() => {
    if (!selectedSupplier) return [] as Array<{ productId: string; quantity: number; product: ProductOption }>;

    const items: Array<{ productId: string; quantity: number; product: ProductOption }> = [];

    for (const product of selectedSupplier.products) {
      const quantity = quantities[product.id] ?? 0;
      if (quantity > 0) {
        items.push({ productId: product.id, quantity, product });
      }
    }

    return items;
  }, [quantities, selectedSupplier]);

  const totalTzs = useMemo(
    () => selectedItems.reduce((sum, item) => sum + item.product.priceTzs * item.quantity, 0),
    [selectedItems],
  );

  const handleQuantityChange = (productId: string, nextValue: string) => {
    const parsed = Number(nextValue);
    setQuantities((current) => ({
      ...current,
      [productId]: Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 0,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!selectedSupplier) {
      setError("Select a supplier before creating an order.");
      return;
    }

    if (!selectedItems.length) {
      setError("Add at least one product quantity to create an order.");
      return;
    }

    const invalidItem = selectedItems.find((item) => item.quantity < item.product.moq);
    if (invalidItem) {
      setError(`${invalidItem.product.name} requires a minimum order of ${invalidItem.product.moq} ${invalidItem.product.unit}.`);
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supplierId: selectedSupplier.id,
          notes: notes.trim() || undefined,
          source: "WEB",
          items: selectedItems.map((item) => ({ productId: item.productId, quantity: item.quantity })),
        }),
      });

      const data = (await response.json()) as {
        error?: string | { message?: string }[];
        order?: {
          id: string;
          orderNumber: string;
          totalUsd: number;
          status: string;
          source: string;
          createdAt: string;
          supplier: { businessName: string };
        };
      };

      if (!response.ok) {
        const message = Array.isArray(data.error)
          ? data.error.map((entry) => entry.message).filter(Boolean).join(", ")
          : data.error || "Failed to create order.";
        throw new Error(message);
      }

      setSuccess(`Order ${data.order?.orderNumber ?? "created"} submitted successfully.`);
      if (data.order && onOptimisticOrderCreated) {
        onOptimisticOrderCreated({
          id: data.order.id,
          orderNumber: data.order.orderNumber,
          totalUsd: data.order.totalUsd,
          status: data.order.status,
          source: data.order.source,
          createdAt: data.order.createdAt,
          items: selectedItems,
          supplier: { businessName: data.order.supplier.businessName },
          importer: { businessName: importerBusinessName },
        });
      }
      setQuantities({});
      setNotes("");
      startTransition(() => {
        router.refresh();
      });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to create order.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="surface-card rounded-[1.85rem] p-5 sm:p-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="font-[var(--font-display)] text-2xl font-semibold tracking-[-0.04em] text-slate-950">
            Create New Order
          </h2>
          <p className="text-sm text-[color:var(--muted)]">
            Build a web order in TZS, grouped by supplier and minimum order quantity.
          </p>
        </div>
        <div className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
          TZS Checkout
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.2fr,0.8fr]">
        <div className="space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-gray-700">Supplier</span>
            <select
              value={selectedSupplierId}
              onChange={(event) => {
                setSelectedSupplierId(event.target.value);
                setQuantities({});
                setError(null);
                setSuccess(null);
              }}
              className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            >
              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.businessName}
                  {supplier.location ? ` - ${supplier.location}` : ""}
                </option>
              ))}
            </select>
          </label>

          {selectedSupplier ? (
            <div className="rounded-[1.5rem] bg-slate-950 p-4 text-white">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 font-semibold">
                  {getInitials(selectedSupplier.businessName)}
                </div>
                <div>
                  <div className="font-medium">{selectedSupplier.businessName}</div>
                  <div className="text-xs text-white/70">{selectedSupplier.location ?? "Location not set"}</div>
                </div>
              </div>
            </div>
          ) : null}

          <div className="space-y-3">
            {selectedSupplier?.products.length ? (
              selectedSupplier.products.map((product) => {
                const quantity = quantities[product.id] ?? 0;
                const lineTotal = product.priceTzs * quantity;

                return (
                  <div key={product.id} className="overflow-hidden rounded-[1.5rem] border border-gray-200 bg-white">
                    <div className="grid gap-4 p-4 md:grid-cols-[128px,1fr,160px]">
                      <div className="aspect-square overflow-hidden rounded-[1.25rem] bg-gradient-to-br from-emerald-100 to-amber-100">
                        {product.imageUrls[0] ? (
                          <img src={product.imageUrls[0]} alt={product.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full flex-col items-center justify-center gap-2 text-slate-500">
                            <ImageIcon className="h-6 w-6" />
                            <span className="text-xs font-medium">No image</span>
                          </div>
                        )}
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="text-xs font-semibold uppercase tracking-wide text-emerald-600">{product.category}</div>
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-700">
                            {product.inStock ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> : <Truck className="h-3.5 w-3.5 text-amber-600" />}
                            {product.inStock ? "In stock" : "Low visibility"}
                          </span>
                        </div>
                        <h3 className="mt-2 font-semibold text-gray-900">{product.name}</h3>
                        <div className="mt-1 text-sm text-gray-500">
                          {formatTzs(product.priceTzs)} / {product.unit}
                        </div>
                        <div className="mt-1 text-xs text-gray-500">MOQ {product.moq} • {product.unit}</div>
                        <div className="mt-3 text-sm text-[color:var(--muted)] line-clamp-2">
                          {product.description ?? "No description added yet for this product."}
                        </div>
                      </div>

                      <div className="w-full">
                        <label className="block text-sm font-medium text-gray-700">Quantity</label>
                        <input
                          type="number"
                          min={0}
                          step={1}
                          value={quantity || ""}
                          onChange={(event) => handleQuantityChange(product.id, event.target.value)}
                          className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                        />
                        <div className="mt-2 text-xs text-gray-500">Line total: {formatTzs(lineTotal)}</div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="rounded-2xl border border-dashed border-gray-300 p-6 text-sm text-gray-500">
                No in-stock products found for this supplier.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-[1.6rem] border border-gray-200 bg-gray-50 p-4">
          <h3 className="font-[var(--font-display)] text-xl font-semibold text-slate-950">Order Summary</h3>
          <div className="mt-4 space-y-3">
            {selectedItems.length ? (
              selectedItems.map((item) => (
                <div key={item.productId} className="flex items-start justify-between gap-3 rounded-2xl bg-white px-4 py-3 text-sm">
                  <div>
                    <div className="font-medium text-gray-900">{item.product.name}</div>
                    <div className="text-gray-500">
                      {item.quantity} x {formatTzs(item.product.priceTzs)}
                    </div>
                  </div>
                  <div className="font-medium text-gray-900">{formatTzs(item.product.priceTzs * item.quantity)}</div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-gray-300 px-4 py-5 text-sm text-gray-500">
                Add product quantities to build your order.
              </div>
            )}
          </div>

          <label className="mt-5 block">
            <span className="mb-2 block text-sm font-medium text-gray-700">Order Notes</span>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={4}
              placeholder="Delivery notes, preferred schedule, or special instructions"
              className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </label>

          <div className="mt-5 rounded-2xl bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>Total</span>
              <span className="text-lg font-semibold text-gray-900">{formatTzs(totalTzs)}</span>
            </div>
          </div>

          {error ? <div className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}
          {success ? (
            <div className="mt-4 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              {success}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={submitting || !selectedSupplier || !selectedSupplier.products.length}
            className="mt-5 w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {submitting ? "Submitting order..." : "Submit Order"}
          </button>
        </div>
      </div>
    </form>
  );
}
