import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RestoPro - نظام إدارة المطاعم الذكي",
  description: "نظام منيو رقمي متكامل مع QR للطاولات وإدارة الطلبات",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={`${inter.variable} h-full`}>
      <body className="min-h-full bg-gray-50 font-sans">{children}</body>
    </html>
  );
}
