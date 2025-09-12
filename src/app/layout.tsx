import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SolanaWalletProvider } from "@/contexts/WalletContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SolanaMail - Encrypted Messaging",
  description: "Send and receive end-to-end encrypted messages with your Solana wallet",
  keywords: ["Solana", "messaging", "encrypted", "blockchain", "wallet", "crypto"],
  authors: [{ name: "SolanaMail Team" }],
  creator: "SolanaMail",
  publisher: "SolanaMail",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://solanamail.com",
    title: "SolanaMail - Encrypted Messaging",
    description: "Send and receive end-to-end encrypted messages with your Solana wallet",
    siteName: "SolanaMail",
    images: [
      {
        url: "https://i.imgur.com/ZrrZrs4.jpeg",
        width: 1200,
        height: 630,
        alt: "SolanaMail Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SolanaMail - Encrypted Messaging",
    description: "Send and receive end-to-end encrypted messages with your Solana wallet",
    images: ["https://i.imgur.com/ZrrZrs4.jpeg"],
    creator: "@SolanaMailweb3",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-900 text-white`}
      >
        <SolanaWalletProvider>
          {children}
        </SolanaWalletProvider>
      </body>
    </html>
  );
}
