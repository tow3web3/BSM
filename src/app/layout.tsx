import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { BSCWalletProvider } from "@/contexts/WalletContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const interBold = Inter({
  variable: "--font-inter-bold",
  subsets: ["latin"],
  weight: "700",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Binance Smart Mail - Secure Blockchain Messaging",
  description: "Send end-to-end encrypted messages using your BSC wallet. No registration required. Your wallet is your identity.",
  keywords: ["Binance Smart Chain", "BSC", "BNB", "blockchain", "messaging", "encrypted", "web3", "crypto", "wallet", "secure messaging", "decentralized", "BSM"],
  authors: [{ name: "Binance Smart Mail" }],
  creator: "Binance Smart Mail",
  publisher: "Binance Smart Mail",
  metadataBase: new URL('https://bsm.center'),
  
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://bsm.center',
    title: 'Binance Smart Mail - Secure Blockchain Messaging',
    description: 'Send end-to-end encrypted messages using your BSC wallet. No registration required.',
    siteName: 'Binance Smart Mail',
    images: [
      {
        url: '/BSM.png',
        width: 1200,
        height: 630,
        alt: 'Binance Smart Mail - Secure Blockchain Messaging',
      }
    ],
  },
  
  twitter: {
    card: 'summary_large_image',
    title: 'Binance Smart Mail - Secure Blockchain Messaging',
    description: 'Send end-to-end encrypted messages using your BSC wallet. No registration required.',
    images: ['/BSM.png'],
    creator: '@BinanceSmartMail',
    site: '@BinanceSmartMail',
  },
  
  icons: {
    icon: [
      { url: '/BSM.png', sizes: 'any', type: 'image/png' },
      { url: '/BSM.png', sizes: '32x32', type: 'image/png' },
      { url: '/BSM.png', sizes: '16x16', type: 'image/png' }
    ],
    apple: '/BSM.png',
    shortcut: '/BSM.png',
  },
  
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  
  verification: {
    google: '',
    // Add your verification codes here when available
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark overflow-x-hidden">
      <body
        className={`${inter.variable} ${interBold.variable} antialiased bg-gradient-to-br from-black via-gray-950 to-black text-white font-bold min-h-screen overflow-x-hidden`}
        suppressHydrationWarning={true}
        style={{ backgroundColor: '#0B0E11' }}
      >
        <BSCWalletProvider>
          {children}
        </BSCWalletProvider>
      </body>
    </html>
  );
}
