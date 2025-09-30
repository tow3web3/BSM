import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SolanaWalletProvider } from "@/contexts/WalletContext";

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
  title: "SolanaMail - Secure Blockchain Messaging",
  description: "Send end-to-end encrypted messages using your Solana wallet. No registration required. Your wallet is your identity.",
  keywords: ["Solana", "blockchain", "messaging", "encrypted", "web3", "crypto", "wallet", "secure messaging", "decentralized"],
  authors: [{ name: "SolanaMail" }],
  creator: "SolanaMail",
  publisher: "SolanaMail",
  metadataBase: new URL('https://solmail.vercel.app'),
  
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://solmail.vercel.app',
    title: 'SolanaMail - Secure Blockchain Messaging',
    description: 'Send end-to-end encrypted messages using your Solana wallet. No registration required.',
    siteName: 'SolanaMail',
    images: [
      {
        url: '/ChatGPT_Image_11_sept._2025_16_17_59.png',
        width: 1200,
        height: 630,
        alt: 'SolanaMail - Secure Blockchain Messaging',
      }
    ],
  },
  
  twitter: {
    card: 'summary_large_image',
    title: 'SolanaMail - Secure Blockchain Messaging',
    description: 'Send end-to-end encrypted messages using your Solana wallet. No registration required.',
    images: ['/ChatGPT_Image_11_sept._2025_16_17_59.png'],
    creator: '@SolanaMailweb3',
    site: '@SolanaMailweb3',
  },
  
  icons: {
    icon: [
      { url: '/ChatGPT_Image_11_sept._2025_16_17_59.png', sizes: 'any', type: 'image/png' },
      { url: '/ChatGPT_Image_11_sept._2025_16_17_59.png', sizes: '32x32', type: 'image/png' },
      { url: '/ChatGPT_Image_11_sept._2025_16_17_59.png', sizes: '16x16', type: 'image/png' }
    ],
    apple: '/ChatGPT_Image_11_sept._2025_16_17_59.png',
    shortcut: '/ChatGPT_Image_11_sept._2025_16_17_59.png',
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
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${interBold.variable} antialiased bg-gradient-to-br from-slate-950 via-gray-900 to-slate-950 text-white font-bold min-h-screen`}
        suppressHydrationWarning={true}
        style={{ backgroundColor: '#0f0f23' }}
      >
        <SolanaWalletProvider>
          {children}
        </SolanaWalletProvider>
      </body>
    </html>
  );
}
