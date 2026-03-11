"use client";

import { useMemo, useState } from "react";
import { PRODUCT_CATEGORIES } from "@/lib/constants";
import { formatTzs } from "@/lib/utils";

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
  createdAt: Date;
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
};

export function ProductManagementPanel({ initialProducts, exchangeRate }: ProductManagementPanelProps) {
  const [products, setProducts] = useState(initialProducts);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductFormState>(defaultFormState);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const editingProduct = useMemo(
    () => products.find((product) => product.id === editingId) ?? null,
    [editingId, products]
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
      setSuccess(editingId ? "Product updated successfully." : "Product created successfully.");
      resetForm();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to save product.");
    } finally {
      setSubmitting(false);
    }
  };

  const removeProduct = async (productId: string) => {
    setDeletingId(productId);
    setError(null);
    setSuccess(null);

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
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Failed to delete product.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr,1.1fr]">
      <form onSubmit={submitProduct} className="rounded-2xl border bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{editingId ? "Edit Product" : "Add Product"}</h2>
            <p className="mt-1 text-sm text-gray-500">Manage supplier inventory in TZS and keep catalog data current.</p>
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
        {success ? <div className="mt-4 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</div> : null}

        <button type="submit" disabled={submitting} className="mt-5 w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-gray-300">
          {submitting ? "Saving product..." : editingId ? "Update Product" : "Create Product"}
        </button>
      </form>

      <div className="rounded-2xl border bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Your Catalog</h2>
            <p className="mt-1 text-sm text-gray-500">Review inventory, update prices in TZS, and keep listings accurate.</p>
          </div>
          <div className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">{products.length} products</div>
        </div>

        <div className="mt-5 space-y-3">
          {products.length ? (
            products.map((product) => (
              <div key={product.id} className="rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wide text-emerald-600">{product.category}</div>
                    <h3 className="mt-1 font-semibold text-gray-900">{product.name}</h3>
                    {product.nameSwahili ? <div className="mt-1 text-sm text-gray-500">{product.nameSwahili}</div> : null}
                    <div className="mt-1 text-sm text-gray-500">{formatTzs(product.priceTzs)} / {product.unit}</div>
                    <div className="mt-1 text-xs text-gray-500">MOQ {product.moq} • {product.inStock ? "In stock" : "Out of stock"}</div>
                    {product.description ? <div className="mt-3 max-w-xl text-sm text-gray-600">{product.description}</div> : null}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => populateForm(product)} className="rounded-xl border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50">
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => removeProduct(product.id)}
                      disabled={deletingId === product.id}
                      className="rounded-xl border border-red-200 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-70"
                    >
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
