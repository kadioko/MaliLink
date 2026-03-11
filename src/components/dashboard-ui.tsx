import { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  description: string;
  action?: ReactNode;
  badge?: ReactNode;
};

export function PageHeader({ title, description, action, badge }: PageHeaderProps) {
  return (
    <div className="rounded-3xl border border-white/60 bg-white/90 p-5 shadow-sm backdrop-blur sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">{title}</h1>
          <p className="mt-2 max-w-2xl text-sm text-gray-500 sm:text-base">{description}</p>
        </div>
        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
          {badge}
          {action}
        </div>
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
  default: "text-gray-900",
  success: "text-emerald-700",
  warning: "text-amber-600",
  danger: "text-red-600",
  info: "text-sky-700",
};

export function StatCard({ label, value, tone = "default", delta }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-white/70 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-5">
      <div className="text-xs font-medium uppercase tracking-[0.18em] text-gray-400">{label}</div>
      <div className={`mt-3 text-2xl font-bold ${toneClasses[tone]}`}>{value}</div>
      {delta ? <div className="mt-2 text-xs font-medium text-gray-500">{delta}</div> : null}
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
    <section className="overflow-hidden rounded-2xl border border-white/70 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-gray-100 bg-gray-50/80 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div>
          <h2 className="text-base font-semibold text-gray-900">{title}</h2>
          {description ? <p className="mt-1 text-sm text-gray-500">{description}</p> : null}
        </div>
        {action}
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </section>
  );
}

type BadgeProps = {
  children: ReactNode;
  tone?: "default" | "success" | "warning" | "danger" | "info";
};

const badgeClasses: Record<NonNullable<BadgeProps["tone"]>, string> = {
  default: "bg-gray-100 text-gray-700 border-gray-200",
  success: "bg-emerald-50 text-emerald-700 border-emerald-200",
  warning: "bg-amber-50 text-amber-700 border-amber-200",
  danger: "bg-red-50 text-red-700 border-red-200",
  info: "bg-sky-50 text-sky-700 border-sky-200",
};

export function Badge({ children, tone = "default" }: BadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${badgeClasses[tone]}`}>
      {children}
    </span>
  );
}

type TabsRowProps = {
  tabs: Array<{ label: string; active?: boolean }>;
};

export function TabsRow({ tabs }: TabsRowProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {tabs.map((tab) => (
        <div
          key={tab.label}
          className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition ${
            tab.active
              ? "border-emerald-300 bg-emerald-100 text-emerald-700"
              : "border-gray-200 bg-white text-gray-600"
          }`}
        >
          {tab.label}
        </div>
      ))}
    </div>
  );
}

type ResponsiveTableProps = {
  children: ReactNode;
};

export function ResponsiveTable({ children }: ResponsiveTableProps) {
  return <div className="-mx-4 overflow-x-auto sm:mx-0">{children}</div>;
}

type EmptyStateProps = {
  icon: string;
  title: string;
  description: string;
};

export function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <div className="py-12 text-center text-gray-400">
      <div className="mb-3 text-4xl">{icon}</div>
      <p className="font-medium text-gray-600">{title}</p>
      <p className="mt-1 text-sm">{description}</p>
    </div>
  );
}
