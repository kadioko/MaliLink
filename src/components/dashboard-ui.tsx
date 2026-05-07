import { ReactNode } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type PageHeaderProps = {
  title: string;
  description: string;
  action?: ReactNode;
  badge?: ReactNode;
};

export function PageHeader({ title, description, action, badge }: PageHeaderProps) {
  return (
    <div className="surface-card-strong relative overflow-hidden rounded-[2rem] p-6 sm:p-7">
      <div className="hero-orb -right-8 top-0 h-32 w-32 bg-emerald-200/70" />
      <div className="hero-orb bottom-0 left-0 h-28 w-28 bg-amber-200/60" />
      <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-3 flex flex-wrap items-center gap-3">{badge}</div>
          <h1 className="font-[var(--font-display)] text-3xl font-bold tracking-[-0.04em] text-slate-950 sm:text-4xl">
            {title}
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[color:var(--muted)] sm:text-base">
            {description}
          </p>
        </div>
        {action ? <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">{action}</div> : null}
      </div>
    </div>
  );
}

type StatCardProps = {
  label: string;
  value: string;
  tone?: "default" | "success" | "warning" | "danger" | "info";
  delta?: string;
};

const toneClasses: Record<NonNullable<StatCardProps["tone"]>, string> = {
  default: "from-slate-900 to-slate-700 text-white",
  success: "from-emerald-700 to-emerald-500 text-white",
  warning: "from-amber-600 to-orange-400 text-white",
  danger: "from-rose-700 to-rose-500 text-white",
  info: "from-sky-700 to-cyan-500 text-white",
};

export function StatCard({ label, value, tone = "default", delta }: StatCardProps) {
  return (
    <div className="surface-card overflow-hidden rounded-[1.65rem] p-[1px]">
      <div
        className={cn(
          "rounded-[calc(1.65rem-1px)] bg-gradient-to-br p-5 sm:p-6",
          toneClasses[tone],
        )}
      >
        <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/75">{label}</div>
        <div className="mt-4 font-[var(--font-display)] text-3xl font-bold tracking-[-0.05em]">{value}</div>
        {delta ? <div className="mt-2 text-xs font-medium text-white/80">{delta}</div> : null}
      </div>
    </div>
  );
}

type SectionCardProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
};

export function SectionCard({ title, description, action, children }: SectionCardProps) {
  return (
    <section className="surface-card overflow-hidden rounded-[1.75rem]">
      <div className="flex flex-col gap-3 border-b border-black/5 bg-white/55 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <h2 className="font-[var(--font-display)] text-lg font-semibold text-slate-950">{title}</h2>
          {description ? <p className="mt-1 text-sm text-[color:var(--muted)]">{description}</p> : null}
        </div>
        {action}
      </div>
      <div className="p-5 sm:p-6">{children}</div>
    </section>
  );
}

type BadgeProps = {
  children: ReactNode;
  tone?: "default" | "success" | "warning" | "danger" | "info";
};

const badgeClasses: Record<NonNullable<BadgeProps["tone"]>, string> = {
  default: "border-slate-200 bg-white/80 text-slate-700",
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  warning: "border-amber-200 bg-amber-50 text-amber-700",
  danger: "border-rose-200 bg-rose-50 text-rose-700",
  info: "border-sky-200 bg-sky-50 text-sky-700",
};

export function Badge({ children, tone = "default" }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
        badgeClasses[tone],
      )}
    >
      {children}
    </span>
  );
}

type TabsRowProps = {
  tabs: Array<{ label: string; active?: boolean; href?: string }>;
};

export function TabsRow({ tabs }: TabsRowProps) {
  return (
    <div className="surface-card flex gap-2 overflow-x-auto rounded-full p-2">
      {tabs.map((tab) => (
        <Link
          key={tab.label}
          href={tab.href ?? "#"}
          className={cn(
            "whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition",
            tab.active
              ? "bg-slate-950 text-white shadow-sm"
              : "bg-transparent text-[color:var(--muted)] hover:bg-white/75",
            !tab.href ? "pointer-events-none" : "",
          )}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}

type ResponsiveTableProps = {
  children: ReactNode;
};

export function ResponsiveTable({ children }: ResponsiveTableProps) {
  return <div className="-mx-5 overflow-x-auto sm:mx-0">{children}</div>;
}

type EmptyStateProps = {
  icon: string;
  title: string;
  description: string;
  action?: ReactNode;
};

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="rounded-[1.5rem] border border-dashed border-[color:var(--border)] bg-white/55 px-6 py-12 text-center">
      <div className="mb-4 text-4xl">{icon}</div>
      <p className="font-[var(--font-display)] text-lg font-semibold text-slate-900">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[color:var(--muted)]">{description}</p>
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}

export function LoadingSpinner({ className }: { className?: string }) {
  return <Loader2 className={cn("h-5 w-5 animate-spin text-emerald-600", className)} />;
}

export function SkeletonCard() {
  return (
    <div className="surface-card animate-pulse rounded-[1.65rem] p-5 space-y-3">
      <div className="h-3 w-20 rounded-full bg-slate-200" />
      <div className="h-7 w-2/3 rounded-full bg-slate-200" />
      <div className="space-y-2 pt-2">
        <div className="h-2.5 rounded-full bg-slate-100" />
        <div className="h-2.5 w-4/5 rounded-full bg-slate-100" />
        <div className="h-2.5 w-3/5 rounded-full bg-slate-100" />
      </div>
    </div>
  );
}

export function LoadingCard({ label = "Loading" }: { label?: string }) {
  return (
    <div className="surface-card animate-pulse rounded-[1.5rem] p-5">
      <div className="h-3 w-24 rounded-full bg-slate-200" />
      <div className="mt-4 h-7 w-2/3 rounded-full bg-slate-200" />
      <div className="mt-5 space-y-2">
        <div className="h-3 rounded-full bg-slate-100" />
        <div className="h-3 w-5/6 rounded-full bg-slate-100" />
      </div>
      <div className="mt-5 text-xs uppercase tracking-[0.18em] text-slate-400">{label}</div>
    </div>
  );
}
