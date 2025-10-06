'use client';

import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { createConfig, http, WagmiProvider, useAccount, useDisconnect, useSignMessage } from 'wagmi';
import { bsc, bscTestnet } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createWeb3Modal } from '@web3modal/wagmi';
import { walletConnect, injected, coinbaseWallet } from 'wagmi/connectors';
import { decryptMessageWithWallet } from '@/lib/encryption';

// Web3Modal configuration
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6';

// Get the correct URL for metadata
const getAppUrl = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return 'https://binance-smart-mail.onrender.com';
};

// Metadata for the app
const metadata = {
  name: 'Binance Smart Mail',
  description: 'Secure blockchain messaging on Binance Smart Chain',
  url: getAppUrl(),
  icons: [`${getAppUrl()}/BSM.png`]
};

// Create wagmi config with ALL wallet connectors
const config = createConfig({
  chains: [bsc, bscTestnet],
  transports: {
    [bsc.id]: http(),
    [bscTestnet.id]: http(),
  },
  connectors: [
    // MetaMask and other injected wallets
    injected({ 
      shimDisconnect: true,
    }),
    // WalletConnect for mobile wallets
    walletConnect({ 
      projectId, 
      metadata,
      showQrModal: true, // Enable QR code for mobile wallets
      qrModalOptions: {
        themeMode: 'dark',
        themeVariables: {
          '--wcm-accent-color': '#F0B90B',
          '--wcm-background-color': '#0B0E11',
        }
      }
    }),
    // Coinbase Wallet
    coinbaseWallet({
      appName: 'Binance Smart Mail',
      appLogoUrl: `${getAppUrl()}/BSM.png`,
      preference: 'all'
    })
  ],
});

// Create Web3Modal with proper configuration
const queryClient = new QueryClient();

interface WalletContextType {
  address: string | undefined;
  connected: boolean;
  connecting: boolean;
  disconnect: () => void;
  signMessage: (message: string) => Promise<string | null>;
  decryptMessage: (ciphertext: string, nonce: string, ephPub: string, fromWallet?: string) => string | null;
  openModal: () => void;
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

// Composant pour fournir le contexte wallet
function WalletContextProvider({ children }: WalletProviderProps) {
  const { address, isConnected, isConnecting } = useAccount();
  const { disconnect: disconnectWallet } = useDisconnect();
  const { signMessageAsync } = useSignMessage();
  const [modal, setModal] = useState<any>(null);

  // Initialize Web3Modal on client side
  useEffect(() => {
    if (typeof window !== 'undefined' && !modal) {
      try {
        const web3Modal = createWeb3Modal({
          wagmiConfig: config,
          projectId,
          enableAnalytics: false, // Disable analytics to prevent errors
          enableOnramp: false,
          themeMode: 'dark',
          themeVariables: {
            '--w3m-accent': '#F0B90B',
            '--w3m-color-mix': '#0B0E11',
            '--w3m-color-mix-strength': 40
          },
          featuredWalletIds: [
            'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // MetaMask
            '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0', // Trust Wallet
            'fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa', // Coinbase Wallet
          ]
        });
        setModal(web3Modal);
      } catch (error) {
        console.error('Error initializing Web3Modal:', error);
      }
    }
  }, [modal]);

  const disconnect = () => {
    disconnectWallet();
  };

  const signMessage = async (message: string): Promise<string | null> => {
    if (!address || !isConnected) {
      throw new Error('Wallet not connected');
    }

    try {
      const signature = await signMessageAsync({ message });
      return signature;
    } catch (error) {
      console.error('Error signing message:', error);
      throw error;
    }
  };

  const decryptMessageLocal = (ciphertext: string, nonce: string, ephPub: string, fromWallet?: string): string | null => {
    if (!address) {
      console.error('Wallet not connected');
      return null;
    }

    try {
      return decryptMessageWithWallet(ciphertext, nonce, ephPub, address, fromWallet);
    } catch (error) {
      console.error('Error decrypting message:', error);
      return null;
    }
  };

  const openModal = () => {
    if (modal) {
      modal.open();
    } else {
      console.warn('Web3Modal not initialized yet, retrying...');
      // Fallback: try to initialize and open
      setTimeout(() => {
        if (modal) {
          modal.open();
        }
      }, 500);
    }
  };

  const value: WalletContextType = {
    address,
    connected: isConnected,
    connecting: isConnecting,
    disconnect,
    signMessage,
    decryptMessage: decryptMessageLocal,
    openModal,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

// Provider principal qui configure les wallets
export function BSCWalletProvider({ children }: WalletProviderProps) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <WalletContextProvider>
          {children}
        </WalletContextProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

// Déclaration globale pour TypeScript
declare global {
  interface Window {
    ethereum?: any;
  }
}
