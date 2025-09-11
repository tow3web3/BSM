'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useWallet as useWalletAdapter } from '@solana/wallet-adapter-react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  TrustWalletAdapter,
  CoinbaseWalletAdapter,
  SolongWalletAdapter,
  TorusWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';
import { PublicKey } from '@solana/web3.js';
import { generateEncryptionKey } from '@/lib/solana-auth';
import { decryptMessage, decryptMessageWithWallet } from '@/lib/encryption';

// Import des styles du wallet adapter
import '@solana/wallet-adapter-react-ui/styles.css';

interface WalletContextType {
  publicKey: PublicKey | null;
  connected: boolean;
  connecting: boolean;
  disconnect: () => Promise<void>;
  signMessage: (message: string) => Promise<Uint8Array | null>;
  decryptMessage: (ciphertext: string, nonce: string, ephPub: string, fromWallet?: string) => string | null;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}

interface WalletProviderProps {
  children: ReactNode;
}

export function SolanaWalletProvider({ children }: WalletProviderProps) {
  const { publicKey, connected, connecting, disconnect: disconnectAdapter, signMessage: signMessageAdapter } = useWalletAdapter();
  const [encryptionKey, setEncryptionKey] = useState<Uint8Array | null>(null);

  const network = WalletAdapterNetwork.Devnet;
  const endpoint = clusterApiUrl(network);

  const wallets = [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter(),
    new TrustWalletAdapter(),
    new CoinbaseWalletAdapter(),
    new SolongWalletAdapter(),
    new TorusWalletAdapter(),
  ];

  useEffect(() => {
    if (!connected) {
      setEncryptionKey(null);
    }
  }, [connected]);

  const disconnect = async () => {
    await disconnectAdapter();
    setEncryptionKey(null);
  };

  const signMessage = async (message: string): Promise<Uint8Array | null> => {
    if (!publicKey || !connected || !signMessageAdapter) {
      throw new Error('Wallet non connecté');
    }

    try {
      const encodedMessage = new TextEncoder().encode(message);
      const signature = await signMessageAdapter(encodedMessage);
      
      // Convertir la signature en Uint8Array si nécessaire
      let signatureBytes: Uint8Array;
      if (signature instanceof Uint8Array) {
        signatureBytes = signature;
      } else if (Array.isArray(signature)) {
        signatureBytes = new Uint8Array(signature);
      } else {
        // Si c'est un objet avec une propriété signature
        signatureBytes = new Uint8Array(signature.signature || signature);
      }
      
      // Générer la clé de chiffrement à partir de la signature
      const key = generateEncryptionKey({
        publicKey: publicKey!,
        signature: signatureBytes,
        message,
      });
      setEncryptionKey(key);
      
      return signatureBytes;
    } catch (error) {
      console.error('Erreur lors de la signature:', error);
      throw error;
    }
  };

  const decryptMessageLocal = (ciphertext: string, nonce: string, ephPub: string, fromWallet?: string): string | null => {
    if (!publicKey) {
      console.error('Wallet non connecté');
      return null;
    }

    try {
      // Utiliser la nouvelle fonction qui dérive la clé à partir de l'adresse du wallet
      return decryptMessageWithWallet(ciphertext, nonce, ephPub, publicKey.toString(), fromWallet);
    } catch (error) {
      console.error('Erreur lors du déchiffrement:', error);
      return null;
    }
  };

  const value: WalletContextType = {
    publicKey,
    connected,
    connecting,
    disconnect,
    signMessage,
    decryptMessage: decryptMessageLocal,
  };

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <WalletContext.Provider value={value}>
            {children}
          </WalletContext.Provider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

// Déclaration globale pour TypeScript
declare global {
  interface Window {
    solana?: any;
  }
}
