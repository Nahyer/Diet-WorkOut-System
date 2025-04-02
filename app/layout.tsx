"use client";

import type React from "react";
import "./globals.css";
import { Inter } from "next/font/google";
import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/footer";
import { AuthProvider, NextAuthProvider } from "./contexts/AuthContext";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isDashboard = pathname.startsWith("/dashboard") || pathname.startsWith("/admin");

  return (
    <html lang="en">
      <body className={inter.className}>
        <NextAuthProvider>
          <AuthProvider>
            <div className="flex min-h-screen flex-col">
              {/* Hide Navbar on dashboard routes */}
              {!isDashboard && <Navbar />}
              <main className="flex-1">{children}</main>
              {!isDashboard && <Footer />}
            </div>
          </AuthProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}