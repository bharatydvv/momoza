import type { Metadata, Viewport } from "next";
import "./globals.css";
import { CartProvider } from "@/context/cart";

export const metadata: Metadata = {
  title: "Momoza — Momos Delivered Hot",
  description: "Order fresh mini momos — steam, fry, kurkure & more. Fast delivery.",
};

export const viewport: Viewport = {
  themeColor: "#0d0d0d",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
