import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "bloom.tv | Stories worth staying for",
  description:
    "A bilingual educational video prototype with free previews and a clearly labeled AutoPay demo.",
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
