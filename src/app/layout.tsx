import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Chebbi Trading — Signaux Forex Gratuits | Partenaire XM",
  description:
    "Chebbi Trading - Signaux Forex GRATUITS. 4 ans de résultats live sur YouTube. Inscrivez-vous sur XM et rejoignez notre groupe.",
  keywords: [
    "Chebbi Trading",
    "Forex",
    "Signaux Forex",
    "Trading Gratuit",
    "XM",
    "XAUUSD",
    "Or",
    "Live YouTube",
  ],
  icons: {
    icon: "https://i.imgur.com/USEEiyC.png",
  },
  openGraph: {
    title: "Chebbi Trading - Signaux Forex Gratuits",
    description:
      "4 ans de résultats live. Rejoignez notre groupe gratuit en ouvrant un compte XM.",
    images: ["https://i.imgur.com/MrRODMe.png"],
    siteName: "Chebbi Trading",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="dark" suppressHydrationWarning>
      <head>
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='light'){document.documentElement.classList.remove('dark')}else{document.documentElement.classList.add('dark')}}catch(e){document.documentElement.classList.add('dark')}})()`,
          }}
        />
      </head>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
