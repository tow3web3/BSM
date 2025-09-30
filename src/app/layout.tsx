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
  title: "SolanaMail - Wallet Messaging",
  description: "Send and receive end-to-end encrypted messages with your Solana wallet",
  icons: {
    icon: [
      { url: '/ChatGPT_Image_11_sept._2025_16_17_59.png', sizes: 'any', type: 'image/png' },
      { url: '/ChatGPT_Image_11_sept._2025_16_17_59.png', sizes: '32x32', type: 'image/png' },
      { url: '/ChatGPT_Image_11_sept._2025_16_17_59.png', sizes: '16x16', type: 'image/png' }
    ],
    apple: '/ChatGPT_Image_11_sept._2025_16_17_59.png',
    shortcut: '/ChatGPT_Image_11_sept._2025_16_17_59.png',
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
        className={`${inter.variable} ${interBold.variable} antialiased bg-gray-900 text-white font-bold`}
        suppressHydrationWarning={true}
      >
        <SolanaWalletProvider>
          {children}
        </SolanaWalletProvider>
      </body>
    </html>
  );
}
