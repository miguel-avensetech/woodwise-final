import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WoodWise - Smart Wood Treatment & Preservation System",
  description: "AI-powered smart recommendation system for mahogany wood treatment and preservation. Scan, diagnose, and maintain your wood with intelligent recommendations.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
