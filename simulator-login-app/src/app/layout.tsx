import "./globals.css";
import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import type { ReactNode } from "react";

const dmSans = DM_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Smart OTP Login Simulator",
  description: "Mock login and OTP flow for integration testing",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="vi" className={dmSans.variable}>
      <body className={dmSans.className}>{children}</body>
    </html>
  );
}
