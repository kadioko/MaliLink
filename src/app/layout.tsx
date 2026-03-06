import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MaliLink - B2B Trade & Import Management",
  description:
    "Digitizing Kariakoo's import economy. Order, credit, and payment management for wholesalers with WhatsApp ordering.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">{children}</body>
    </html>
  );
}
