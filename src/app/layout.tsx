import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { ModalProvider } from "@/providers/modal-provider";
import { NextAuthProvider } from "@/providers/next-auth";

import "./globals.css";
import { ToastProvider } from "@/providers/toast-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Admin Dashboard for Store",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">
      <body className={inter.className}>
        <NextAuthProvider>
          <ToastProvider />
          <ModalProvider />
          {children}
        </NextAuthProvider>
      </body>
    </html>
  );
}
