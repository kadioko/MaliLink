"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { CheckCircle2, ShieldCheck, ShieldOff, UserCheck, UserX } from "lucide-react";
import { Badge, EmptyState, PageHeader, ResponsiveTable, SectionCard, StatCard } from "@/components/dashboard-ui";

type UserRecord = {
  id: string;
  name: string;
  businessName: string;
  email: string;
  phone: string;
  role: string;
  kycStatus: string;
  location: string | null;
  isSuspended: boolean;
  emailVerifiedAt: string | null;
  phoneVerifiedAt: string | null;
  createdAt: string;
  _count: { importerOrders: number; supplierOrders: number; products: number };
};

const roleTone: Record<string, "success" | "warning" | "info" | "default" | "danger"> = {
  IMPORTER: "info",
  SUPPLIER: "success",
  ADMIN: "warning",
};

export default function AdminUsersPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  useEffect(() => {
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then(({ users }) => setUsers(users ?? []))
      .finally(() => setIsLoading(false));
  }, []);

  async function doAction(userId: string, action: "suspend" | "activate" | "verify-kyc") {
    setActionLoading(`${userId}-${action}`);
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, action }),
    });
    if (res.ok) {
      setUsers((prev) =>
        prev.map((u) => {
          if (u.id !== userId) return u;
          if (action === "suspend") return { ...u, isSuspended: true };
          if (action === "activate") return { ...u, isSuspended: false };
          if (action === "verify-kyc") return { ...u, kycStatus: "VERIFIED" };
          return u;
        }),
      );
    }
    setActionLoading(null);
  }

  const filtered = users.filter((u) => {
    const matchRole = roleFilter === "ALL" || u.role === roleFilter;
    const matchSearch =
      !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.businessName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  const totalSuppliers = users.filter((u) => u.role === "SUPPLIER").length;
  const totalImporters = users.filter((u) => u.role === "IMPORTER").length;
  const pendingKyc = users.filter((u) => u.kycStatus === "PENDING").length;
  const suspended = users.filter((u) => u.isSuspended).length;

  if (session?.user.role !== "ADMIN") {
    return (
      <div className="mx-auto max-w-3xl p-4 sm:p-6">
        <SectionCard title="Access Restricted" description="Admin only.">
          <p className="text-sm text-gray-500">You do not have permission to view this page.</p>
        </SectionCard>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">
      <PageHeader
        title="User Management"
        description="View, verify, and manage all registered accounts across the MaliLink marketplace."
        badge={<Badge tone="warning">Admin Only</Badge>}
        action={<Badge tone="default">{users.length} total accounts</Badge>}
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Importers" value={String(totalImporters)} tone="info" />
        <StatCard label="Suppliers" value={String(totalSuppliers)} tone="success" />
        <StatCard label="Pending KYC" value={String(pendingKyc)} tone="warning" delta="Awaiting verification" />
        <StatCard label="Suspended" value={String(suspended)} tone="danger" delta="Currently restricted" />
      </div>

      <SectionCard title="All Accounts" description="Search, filter, and take actions on individual accounts.">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, business, or email…"
            className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
          <div className="flex gap-2">
            {["ALL", "IMPORTER", "SUPPLIER", "ADMIN"].map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                  roleFilter === r
                    ? "bg-slate-950 text-white"
                    : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-14 animate-pulse rounded-xl bg-gray-100" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState icon="👥" title="No accounts found" description="Try adjusting your search or filter." />
        ) : (
          <ResponsiveTable>
            <table className="min-w-[900px] w-full">
              <thead>
                <tr className="border-b bg-gray-50/60">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Account</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Role</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">KYC</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Activity</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Joined</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => (
                  <tr key={user.id} className={`border-b last:border-b-0 hover:bg-gray-50/50 ${user.isSuspended ? "opacity-60" : ""}`}>
                    <td className="px-4 py-3">
                      <p className="text-sm font-semibold text-gray-900">{user.businessName}</p>
                      <p className="text-xs text-gray-500">{user.name} · {user.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={roleTone[user.role] ?? "default"}>{user.role}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={user.kycStatus === "VERIFIED" ? "success" : user.kycStatus === "REJECTED" ? "danger" : "warning"}>
                        {user.kycStatus}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {user.role === "SUPPLIER"
                        ? `${user._count.supplierOrders} orders · ${user._count.products} products`
                        : `${user._count.importerOrders} orders`}
                    </td>
                    <td className="px-4 py-3">
                      {user.isSuspended ? (
                        <Badge tone="danger">Suspended</Badge>
                      ) : (
                        <div className="flex items-center gap-1 text-xs text-emerald-600">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Active
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      {user.id !== session.user.id ? (
                        <div className="flex items-center gap-2">
                          {user.kycStatus !== "VERIFIED" ? (
                            <button
                              onClick={() => doAction(user.id, "verify-kyc")}
                              disabled={actionLoading === `${user.id}-verify-kyc`}
                              title="Verify KYC"
                              className="rounded-lg border border-emerald-200 bg-emerald-50 p-1.5 text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-50"
                            >
                              <ShieldCheck className="h-3.5 w-3.5" />
                            </button>
                          ) : null}
                          {user.isSuspended ? (
                            <button
                              onClick={() => doAction(user.id, "activate")}
                              disabled={actionLoading === `${user.id}-activate`}
                              title="Activate account"
                              className="rounded-lg border border-sky-200 bg-sky-50 p-1.5 text-sky-700 transition hover:bg-sky-100 disabled:opacity-50"
                            >
                              <UserCheck className="h-3.5 w-3.5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => doAction(user.id, "suspend")}
                              disabled={actionLoading === `${user.id}-suspend`}
                              title="Suspend account"
                              className="rounded-lg border border-red-200 bg-red-50 p-1.5 text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                            >
                              <UserX className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">You</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ResponsiveTable>
        )}
      </SectionCard>
    </div>
  );
}
