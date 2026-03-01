import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
});

export const metadata: Metadata = {
  title: "Electro Mart - Home Appliances",
  description: "Your trusted partner for high-quality home appliances in Algeria.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body
        className={`${inter.variable} bg-white md:dark:bg-slate-900 font-display text-slate-900 md:dark:text-slate-100 antialiased overflow-x-hidden`}
      >
        {children}
      </body>
    </html>
  );
}
