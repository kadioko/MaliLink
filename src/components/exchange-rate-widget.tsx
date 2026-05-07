"use client";

import { useEffect, useState } from "react";
import { RefreshCw, TrendingUp } from "lucide-react";

type Props = {
  defaultRate: number;
  isAdmin?: boolean;
};

export function ExchangeRateWidget({ defaultRate, isAdmin }: Props) {
  const [rate, setRate] = useState(defaultRate);
  const [editing, setEditing] = useState(false);
  const [draftRate, setDraftRate] = useState(String(defaultRate));
  const [saving, setSaving] = useState(false);
  const [lastUpdated] = useState(() => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));

  async function save() {
    const parsed = Number(draftRate);
    if (!parsed || parsed <= 0) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/exchange-rate", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rate: parsed }),
      });
      if (res.ok) {
        setRate(parsed);
        setEditing(false);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-2xl border border-emerald-200/60 bg-emerald-50/40 px-4 py-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
          <span className="text-xs font-semibold text-emerald-800">USD / TZS</span>
        </div>
        {isAdmin ? (
          <button
            onClick={() => { setEditing((v) => !v); setDraftRate(String(rate)); }}
            className="text-[10px] font-medium text-emerald-600 hover:underline"
          >
            {editing ? "Cancel" : "Edit"}
          </button>
        ) : (
          <RefreshCw className="h-3 w-3 text-emerald-400" />
        )}
      </div>

      {editing && isAdmin ? (
        <div className="mt-2 flex items-center gap-2">
          <input
            type="number"
            value={draftRate}
            onChange={(e) => setDraftRate(e.target.value)}
            className="w-28 rounded-lg border border-emerald-300 bg-white px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            min={100}
            max={99999}
          />
          <button
            onClick={save}
            disabled={saving}
            className="rounded-lg bg-emerald-600 px-2.5 py-1 text-[11px] font-semibold text-white disabled:opacity-60"
          >
            {saving ? "…" : "Save"}
          </button>
        </div>
      ) : (
        <div className="mt-1.5 font-[var(--font-display)] text-xl font-bold tracking-tight text-slate-950">
          {rate.toLocaleString()}
        </div>
      )}

      <p className="mt-1 text-[10px] text-emerald-600/70">Updated {lastUpdated}</p>
    </div>
  );
}
