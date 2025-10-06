'use client';

import React, { useState, useEffect } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { generateAuthMessage } from '@/lib/bsc-auth';

interface WalletButtonProps {
  onAuthSuccess?: (address: string) => void;
}

// Access the Web3Modal instance globally
const openWeb3Modal = () => {
  if (typeof window !== 'undefined' && (window as any).modal) {
    (window as any).modal.open();
  }
};

export default function WalletButton({ onAuthSuccess }: WalletButtonProps) {
  const { address, connected, connecting, disconnect, signMessage } = useWallet();
  const [authenticating, setAuthenticating] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [hasSessionToken, setHasSessionToken] = useState(false);

  // Ensure we're on client side before accessing localStorage
  useEffect(() => {
    setIsClient(true);
    setHasSessionToken(!!localStorage.getItem('sessionToken'));
  }, []);

  // Update session token state when connected state changes
  useEffect(() => {
    if (isClient) {
      setHasSessionToken(!!localStorage.getItem('sessionToken'));
    }
  }, [connected, isClient]);

  const handleConnect = () => {
    openWeb3Modal();
  };

  const handleAuthenticate = async () => {
    if (!address) return;

    setAuthenticating(true);
    try {
      // Generate authentication message
      const authMessage = generateAuthMessage(address);
      
      // Sign the message
      const signature = await signMessage(authMessage);
      
      if (signature) {
        // Send authentication to server
        const response = await fetch('/api/auth', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            publicKey: address,
            signature: signature,
            message: authMessage,
          }),
        });

        const result = await response.json();

        if (result.success) {
          localStorage.setItem('sessionToken', result.sessionToken);
          setHasSessionToken(true);
          onAuthSuccess?.(address);
        } else {
          alert('Authentication error: ' + result.error);
        }
      }
    } catch (error) {
      console.error('Error during authentication:', error);
      alert('Authentication error: ' + (error as Error).message);
    } finally {
      setAuthenticating(false);
    }
  };

  const handleDisconnect = () => {
    localStorage.removeItem('sessionToken');
    localStorage.removeItem('walletAddress');
    setHasSessionToken(false);
    disconnect();
  };

  if (!connected) {
    return (
      <button
        onClick={handleConnect}
        disabled={connecting}
        className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 border-none transition-all duration-300 ease-out disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 to-yellow-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="relative flex items-center gap-3 px-6 py-3">
          <div className="flex items-center justify-center w-5 h-5">
            {connecting ? (
              <svg 
                className="animate-spin w-5 h-5 text-white/70" 
                fill="none" 
                viewBox="0 0 24 24"
              >
                <circle 
                  className="opacity-25" 
                  cx="12" 
                  cy="12" 
                  r="10" 
                  stroke="currentColor" 
                  strokeWidth="2"
                />
                <path 
                  className="opacity-75" 
                  fill="currentColor" 
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            ) : (
              <svg 
                className="w-5 h-5 text-white transition-colors duration-200" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="1.5" 
                  d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9v3"
                />
              </svg>
            )}
          </div>
          
          <span className="text-sm font-medium text-white transition-colors duration-200">
            {connecting ? 'Connecting...' : 'Start Messaging'}
          </span>
        </div>
      </button>
    );
  }

  if (!isClient || !hasSessionToken) {
    return (
      <button
        onClick={handleAuthenticate}
        disabled={authenticating}
        className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 border border-yellow-500/20 hover:border-yellow-500/40 backdrop-blur-sm transition-all duration-300 ease-out hover:from-yellow-500/20 hover:to-yellow-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 to-yellow-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="relative flex items-center gap-3 px-6 py-3">
          <div className="flex items-center justify-center w-5 h-5">
            {authenticating ? (
              <svg 
                className="animate-spin w-5 h-5 text-yellow-400" 
                fill="none" 
                viewBox="0 0 24 24"
              >
                <circle 
                  className="opacity-25" 
                  cx="12" 
                  cy="12" 
                  r="10" 
                  stroke="currentColor" 
                  strokeWidth="2"
                />
                <path 
                  className="opacity-75" 
                  fill="currentColor" 
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            ) : (
              <svg 
                className="w-5 h-5 text-yellow-400 group-hover:text-yellow-300 transition-colors duration-200" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="1.5" 
                  d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                />
              </svg>
            )}
          </div>
          
          <span className="text-sm font-medium text-yellow-300 group-hover:text-yellow-200 transition-colors duration-200">
            {authenticating ? 'Authenticating...' : 'Sign In'}
          </span>
        </div>
        
        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-yellow-500/60 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out" />
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {/* Wallet Info */}
      <div className="hidden sm:flex items-center gap-3 px-4 py-2 rounded-lg bg-white/5 border border-white/10 backdrop-blur-sm">
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
        </div>
        <span className="text-xs font-mono text-white/70 tracking-wider">
          {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ''}
        </span>
      </div>

      {/* Disconnect Button */}
      <button
        onClick={handleDisconnect}
        className="group relative overflow-hidden rounded-lg bg-white/5 border border-white/10 hover:border-red-400/30 backdrop-blur-sm transition-all duration-300 ease-out hover:bg-red-500/10"
      >
        <div className="absolute inset-0 bg-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="relative flex items-center gap-2 px-3 py-2">
          <svg 
            className="w-4 h-4 text-white/60 group-hover:text-red-400 transition-colors duration-200" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="1.5" 
              d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
            />
          </svg>
          <span className="hidden sm:inline text-xs font-medium text-white/60 group-hover:text-red-400 transition-colors duration-200">
            Disconnect
          </span>
        </div>
        
        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-red-400/60 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out" />
      </button>
    </div>
  );
}
