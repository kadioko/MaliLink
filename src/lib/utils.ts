import { PLATFORM_FEE_RATE } from "./constants";

export function formatCurrency(amount: number, currency: "USD" | "TZS" = "USD"): string {
  if (currency === "TZS") {
    return `TZS ${amount.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  }
  return `$${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function calculatePlatformFee(amountUsd: number): number {
  return Math.round(amountUsd * PLATFORM_FEE_RATE * 100) / 100;
}

export function generateOrderNumber(): string {
  const date = new Date();
  const prefix = "ML";
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}${year}${month}-${random}`;
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function daysBetween(date1: Date, date2: Date): number {
  const diff = Math.abs(date2.getTime() - date1.getTime());
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function isOverdue(dueDate: Date): boolean {
  return new Date() > dueDate;
}
