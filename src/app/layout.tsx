import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "MaliLink - B2B Trade & Import Management",
  description:
    "TZS-first trade operations for Kariakoo wholesalers with role-aware dashboards, WhatsApp ordering, credit tracking, and mobile payments.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
