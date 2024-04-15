import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ReactNode } from "react";
import { inject } from "@vercel/analytics";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SciPhi Basic RAG",
  description:
    "Robust AI Powered RAG.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  inject();

  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}