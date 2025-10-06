'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { createConfig, http, WagmiProvider, useAccount, useDisconnect, useSignMessage } from 'wagmi';
import { bsc, bscTestnet } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createWeb3Modal } from '@web3modal/wagmi';
import { walletConnect, injected, coinbaseWallet } from 'wagmi/connectors';
import { decryptMessageWithWallet } from '@/lib/encryption';

// Web3Modal configuration
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6';

// Metadata for the app
const metadata = {
  name: 'Binance Smart Mail',
  description: 'Secure blockchain messaging on Binance Smart Chain',
  url: typeof window !== 'undefined' ? window.location.origin : 'https://binancesmartmail.com',
  icons: ['https://binancesmartmail.com/BSM.png']
};

// Create wagmi config with multiple connectors
const config = createConfig({
  chains: [bsc, bscTestnet],
  transports: {
    [bsc.id]: http(),
    [bscTestnet.id]: http(),
  },
  connectors: [
    injected({ shimDisconnect: true }),
    walletConnect({ 
      projectId, 
      metadata,
      showQrModal: false 
    }),
    coinbaseWallet({
      appName: 'Binance Smart Mail',
      appLogoUrl: 'https://binancesmartmail.com/BSM.png'
    })
  ],
});

// Create Web3Modal
let modal: any;
if (typeof window !== 'undefined') {
  modal = createWeb3Modal({
    wagmiConfig: config,
    projectId,
    enableAnalytics: true,
    enableOnramp: false,
    themeMode: 'dark',
    themeVariables: {
      '--w3m-accent': '#F0B90B',
      '--w3m-color-mix': '#0B0E11',
      '--w3m-color-mix-strength': 40
    }
  });
}

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
