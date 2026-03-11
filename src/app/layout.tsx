import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import { SettingsProvider } from "@/context/SettingsContext";
import WhatsAppButton from "@/components/WhatsAppButton";
import ThemeInjector from "@/components/ThemeInjector";
import FacebookPixel from "@/components/FacebookPixel";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
});

export const metadata: Metadata = {
  title: "Electro Mart - Électroménager en Algérie",
  description: "Découvrez le plus grand choix d'électroménager authentique en Algérie. Meilleurs prix, garantie assurée et livraison à domicile.",
  openGraph: {
    title: "Electro Mart - Électroménager en Algérie",
    description: "Meilleurs prix, garantie assurée et livraison à domicile.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="overflow-x-hidden">
      <head>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                for (let i = 0; i < localStorage.length; i++) {
                  const key = localStorage.key(i);
                  if (key && key.startsWith('sb-') && key.endsWith('-auth-token')) {
                    localStorage.removeItem(key);
                  }
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body
        className={`${inter.variable} bg-white md:dark:bg-slate-900 font-display text-slate-900 md:dark:text-slate-100 antialiased overflow-x-hidden`}
      >
        <SettingsProvider>
          <ThemeInjector />
          <FacebookPixel />
          {children}
          <WhatsAppButton />
        </SettingsProvider>
        <Analytics />
      </body>
    </html>
  );
}

