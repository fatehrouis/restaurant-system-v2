import type { Metadata } from "next";
import "./globals.css";
import Toast from "./components/Toast";

export const metadata: Metadata = {
  title: "RestoPro",
  description: "نظام إدارة المطاعم الذكي",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar">
      <body>
        <Toast />
        {children}
      </body>
    </html>
  );
}
