import type { Metadata } from "next";
import AppProviders from "@/providers/AppProviders";
import "antd/dist/reset.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Retails Tech Smart OTP",
  description: "Internal console for Retails Tech Smart OTP management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased" suppressHydrationWarning>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
