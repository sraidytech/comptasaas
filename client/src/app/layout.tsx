import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { DebugInitializer } from "@/components/debug/debug-initializer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SRACOM COMPTA Management System",
  description: "A comprehensive multi-tenant accounting management system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster />
        <DebugInitializer />
      </body>
    </html>
  );
}
