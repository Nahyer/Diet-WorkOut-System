
import type React from "react";
import "./globals.css";
import { Inter } from "next/font/google";

import { AuthProvider, NextAuthProvider } from "./contexts/AuthContext";
import { LayoutWrapper } from "@/components/LayoutWrapper";

const inter = Inter({ subsets: ["latin"] });
export const metadata = {
  title: "Diet & Workout System",
  description: "A comprehensive system for managing diet and workout plans",
  keywords: "diet, workout, fitness, health, nutrition",
  viewport: "width=device-width, initial-scale=1",
  icons: {
    icon: "/pngwing.com.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {


  return (
    <html lang="en">
      <body className={inter.className}>
        <NextAuthProvider>
          <AuthProvider>
            <LayoutWrapper>{children}</LayoutWrapper>
          </AuthProvider>
        </NextAuthProvider>
      </body>
    </html>
  );

}