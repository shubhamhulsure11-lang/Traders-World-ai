import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Traders World AI — AI Trading Copilot",
  description: "An AI Trading Operating System built on Smart Money Concepts.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-gray-200 antialiased h-screen flex flex-col overflow-hidden">
        {children}
      </body>
    </html>
  );
}
