"use client";

import { startTransition, useMemo, useState } from "react";
import { CheckCircle2, ImageIcon, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { PRODUCT_CATEGORIES } from "@/lib/constants";
import { formatTzs, getInitials } from "@/lib/utils";

type ManagedProduct = {
  id: string;
  name: string;
  nameSwahili: string | null;
  description: string | null;
  category: string;
  unit: string;
  priceUsd: number;
  priceTzs: number;
  moq: number;
  inStock: boolean;
  imageUrls: string[];
  createdAt: Date | string;
};

type ProductFormState = {
  name: string;
  nameSwahili: string;
  description: string;
  category: string;
  unit: string;
  priceTzs: string;
  moq: string;
  imageUrls: string;
  inStock: boolean;
};

const defaultFormState: ProductFormState = {
  name: "",
  nameSwahili: "",
  description: "",
  category: PRODUCT_CATEGORIES[0],
  unit: "piece",
  priceTzs: "",
  moq: "1",
  imageUrls: "",
  inStock: true,
};

type ProductManagementPanelProps = {
  initialProducts: ManagedProduct[];
  exchangeRate: number;
  onOptimisticProductCreated?: (product: ManagedProduct) => void;
  onOptimisticProductUpdated?: (product: ManagedProduct, previousProduct: ManagedProduct) => void;
  onOptimisticProductDeleted?: (product: ManagedProduct) => void;
  onOptimisticProductCommitted?: (tempId: string, product: ManagedProduct) => void;
  onOptimisticProductFailed?: (
    context:
      | { type: "create"; tempId: string; message: string }
      | { type: "update"; previous: ManagedProduct; message: string }
      | { type: "delete"; previous: ManagedProduct; message: string },
  ) => void;
};

export function ProductManagementPanel({
  initialProducts,
  exchangeRate,
  onOptimisticProductCreated,
  onOptimisticProductUpdated,
  onOptimisticProductDeleted,
  onOptimisticProductCommitted,
  onOptimisticProductFailed,
}: ProductManagementPanelProps) {
  const router = useRouter();
  const [products, setProducts] = useState(initialProducts);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductFormState>(defaultFormState);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const editingProduct = useMemo(
    () => products.find((product) => product.id === editingId) ?? null,
    [editingId, products],
  );

  const resetForm = () => {
    setEditingId(null);
    setForm(defaultFormState);
  };

  const populateForm = (product: ManagedProduct) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      nameSwahili: product.nameSwahili ?? "",
      description: product.description ?? "",
      category: product.category,
      unit: product.unit,
      priceTzs: String(product.priceTzs),
      moq: String(product.moq),
      imageUrls: product.imageUrls.join(", "),
      inStock: product.inStock,
    });
    setError(null);
    setSuccess(null);
  };

  const handleChange = <K extends keyof ProductFormState>(key: K, value: ProductFormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const submitProduct = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const priceTzs = Number(form.priceTzs);
    const moq = Number(form.moq);

    if (!Number.isFinite(priceTzs) || priceTzs <= 0) {
      setError("Enter a valid TZS price.");
      return;
    }

    if (!Number.isFinite(moq) || moq <= 0) {
      setError("Enter a valid MOQ.");
      return;
    }

    const payload = {
      name: form.name.trim(),
      nameSwahili: form.nameSwahili.trim() || undefined,
      description: form.description.trim() || undefined,
      category: form.category,
      unit: form.unit.trim(),
      priceTzs,
      priceUsd: Number((priceTzs / exchangeRate).toFixed(2)),
      moq,
      inStock: form.inStock,
      imageUrls: form.imageUrls
        .split(",")
        .map((entry) => entry.trim())
        .filter(Boolean),
    };

    setSubmitting(true);
    const tempId = editingId ?? `temp-product-${crypto.randomUUID()}`;
    const optimisticProduct: ManagedProduct = {
      id: tempId,
      name: payload.name,
      nameSwahili: payload.nameSwahili ?? null,
      description: payload.description ?? null,
      category: payload.category,
      unit: payload.unit,
      priceUsd: payload.priceUsd,
      priceTzs: payload.priceTzs,
      moq: payload.moq,
      inStock: payload.inStock,
      imageUrls: payload.imageUrls,
      createdAt: new Date().toISOString(),
    };
    const previousProduct = editingId ? products.find((product) => product.id === editingId) ?? null : null;
    if (editingId && previousProduct) {
      onOptimisticProductUpdated?.(optimisticProduct, previousProduct);
    } else {
      onOptimisticProductCreated?.(optimisticProduct);
    }

    try {
      const endpoint = editingId ? `/api/products/${editingId}` : "/api/products";
      const method = editingId ? "PATCH" : "POST";
      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as { product?: ManagedProduct; error?: string | { message?: string }[] };
      if (!response.ok || !data.product) {
        const message = Array.isArray(data.error)
          ? data.error.map((entry) => entry.message).filter(Boolean).join(", ")
          : data.error || "Failed to save product.";
        throw new Error(message);
      }

      setProducts((current) => {
        const next = editingId
          ? current.map((product) => (product.id === data.product?.id ? data.product : product))
          : [data.product!, ...current];
        return next;
      });
      onOptimisticProductCommitted?.(tempId, data.product);
      setSuccess(editingId ? "Product updated successfully." : "Product created successfully.");
      resetForm();
      startTransition(() => {
        router.refresh();
      });
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : "Failed to save product.";
      setError(message);
      if (editingId && previousProduct) {
        onOptimisticProductFailed?.({ type: "update", previous: previousProduct, message });
      } else {
        onOptimisticProductFailed?.({ type: "create", tempId, message });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const removeProduct = async (productId: string) => {
    setDeletingId(productId);
    setError(null);
    setSuccess(null);
    const previousProduct = products.find((product) => product.id === productId);
    if (previousProduct) {
      onOptimisticProductDeleted?.(previousProduct);
    }

    try {
      const response = await fetch(`/api/products/${productId}`, { method: "DELETE" });
      const data = (await response.json()) as { success?: boolean; error?: string };
      if (!response.ok) {
        throw new Error(data.error || "Failed to delete product.");
      }

      setProducts((current) => current.filter((product) => product.id !== productId));
      if (editingId === productId) {
        resetForm();
      }
      setSuccess("Product deleted successfully.");
      startTransition(() => {
        router.refresh();
      });
    } catch (deleteError) {
      const message = deleteError instanceof Error ? deleteError.message : "Failed to delete product.";
      setError(message);
      if (previousProduct) {
        onOptimisticProductFailed?.({ type: "delete", previous: previousProduct, message });
      }
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr,1.1fr]">
      <form onSubmit={submitProduct} className="surface-card rounded-[1.85rem] p-5 sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-[var(--font-display)] text-2xl font-semibold tracking-[-0.04em] text-slate-950">
              {editingId ? "Edit Product" : "Add Product"}
            </h2>
            <p className="mt-1 text-sm text-[color:var(--muted)]">
              Manage supplier inventory in TZS and keep catalog data current.
            </p>
          </div>
          {editingId ? (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-xl border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              Cancel Edit
            </button>
          ) : null}
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
            <div className="text-xs uppercase tracking-wide text-gray-400">Current catalog</div>
            <div className="mt-2 text-lg font-semibold text-gray-900">{products.length} products</div>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
            <div className="text-xs uppercase tracking-wide text-gray-400">Editing mode</div>
            <div className="mt-2 text-lg font-semibold text-gray-900">{editingProduct ? "Active" : "New entry"}</div>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-gray-700">Product Name</span>
              <input value={form.name} onChange={(event) => handleChange("name", event.target.value)} className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-gray-700">Swahili Name</span>
              <input value={form.nameSwahili} onChange={(event) => handleChange("nameSwahili", event.target.value)} className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" />
            </label>
          </div>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-gray-700">Description</span>
            <textarea value={form.description} onChange={(event) => handleChange("description", event.target.value)} rows={4} className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-gray-700">Category</span>
              <select value={form.category} onChange={(event) => handleChange("category", event.target.value)} className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100">
                {PRODUCT_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-gray-700">Unit</span>
              <input value={form.unit} onChange={(event) => handleChange("unit", event.target.value)} className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-gray-700">Price (TZS)</span>
              <input type="number" min={0} value={form.priceTzs} onChange={(event) => handleChange("priceTzs", event.target.value)} className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-gray-700">MOQ</span>
              <input type="number" min={1} value={form.moq} onChange={(event) => handleChange("moq", event.target.value)} className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" />
            </label>
          </div>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-gray-700">Image URLs</span>
            <input value={form.imageUrls} onChange={(event) => handleChange("imageUrls", event.target.value)} placeholder="Comma-separated URLs" className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" />
          </label>

          <label className="flex items-center gap-3 rounded-xl border border-gray-200 px-3 py-3 text-sm text-gray-700">
            <input type="checkbox" checked={form.inStock} onChange={(event) => handleChange("inStock", event.target.checked)} />
            Mark product as in stock
          </label>
        </div>

        {error ? <div className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}
        {success ? (
          <div className="mt-4 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {success}
          </div>
        ) : null}

        <button type="submit" disabled={submitting} className="mt-5 w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-gray-300">
          {submitting ? "Saving product..." : editingId ? "Update Product" : "Create Product"}
        </button>
      </form>

      <div className="surface-card rounded-[1.85rem] p-5 sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-[var(--font-display)] text-2xl font-semibold tracking-[-0.04em] text-slate-950">
              Your Catalog
            </h2>
            <p className="mt-1 text-sm text-[color:var(--muted)]">
              Review inventory, update prices in TZS, and keep listings accurate.
            </p>
          </div>
          <div className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">{products.length} products</div>
        </div>

        <div className="mt-5 space-y-3">
          {products.length ? (
            products.map((product) => (
              <div key={product.id} className="overflow-hidden rounded-[1.5rem] border border-gray-200 bg-white">
                <div className="grid gap-4 p-4 md:grid-cols-[120px,1fr,auto]">
                  <div className="aspect-square overflow-hidden rounded-[1.25rem] bg-gradient-to-br from-emerald-100 to-amber-100">
                    {product.imageUrls[0] ? (
                      <img src={product.imageUrls[0]} alt={product.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full flex-col items-center justify-center gap-2 text-slate-500">
                        <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-950 text-base font-semibold text-white">
                          {getInitials(product.name)}
                        </div>
                        <div className="inline-flex items-center gap-1 text-xs font-medium">
                          <ImageIcon className="h-3.5 w-3.5" />
                          Needs image
                        </div>
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="text-xs font-semibold uppercase tracking-wide text-emerald-600">{product.category}</div>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${product.inStock ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
                        {product.inStock ? <CheckCircle2 className="h-3.5 w-3.5" /> : <ImageIcon className="h-3.5 w-3.5" />}
                        {product.inStock ? "Ready to sell" : "Out of stock"}
                      </span>
                    </div>
                    <h3 className="mt-2 font-semibold text-gray-900">{product.name}</h3>
                    {product.nameSwahili ? <div className="mt-1 text-sm text-gray-500">{product.nameSwahili}</div> : null}
                    <div className="mt-2 text-sm text-gray-500">{formatTzs(product.priceTzs)} / {product.unit}</div>
                    <div className="mt-1 text-xs text-gray-500">MOQ {product.moq} • added {new Date(product.createdAt).toLocaleDateString()}</div>
                    {product.description ? <div className="mt-3 max-w-xl text-sm text-gray-600">{product.description}</div> : null}
                  </div>
                  <div className="flex flex-wrap gap-2 md:flex-col">
                    <button type="button" onClick={() => populateForm(product)} className="inline-flex items-center gap-2 rounded-xl border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50">
                      <Pencil className="h-4 w-4" />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => removeProduct(product.id)}
                      disabled={deletingId === product.id}
                      className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      <Trash2 className="h-4 w-4" />
                      {deletingId === product.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-gray-300 p-6 text-sm text-gray-500">
              You have not added any products yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
