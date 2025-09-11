'use client';

import React, { useState } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { generateAuthMessage } from '@/lib/solana-auth';

interface WalletButtonProps {
  onAuthSuccess?: (publicKey: string) => void;
}

export default function WalletButton({ onAuthSuccess }: WalletButtonProps) {
  const { publicKey, connected, connecting, disconnect, signMessage } = useWallet();
  const { setVisible } = useWalletModal();
  const [authenticating, setAuthenticating] = useState(false);

  const handleConnect = () => {
    setVisible(true);
  };

  const handleAuthenticate = async () => {
    if (!publicKey) return;

    setAuthenticating(true);
    try {
      // Générer le message d'authentification
      const authMessage = generateAuthMessage(publicKey);
      
      // Signer le message
      const signature = await signMessage(authMessage);
      
      if (signature) {
        // Convertir la signature en base64
        let signatureBase64: string;
        if (signature instanceof Uint8Array) {
          signatureBase64 = Buffer.from(signature).toString('base64');
        } else {
          signatureBase64 = Buffer.from(new Uint8Array(signature)).toString('base64');
        }
        
        // Envoyer l'authentification au serveur
        const response = await fetch('/api/auth', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            publicKey: publicKey.toString(),
            signature: signatureBase64,
            message: authMessage,
          }),
        });

        const result = await response.json();

        if (result.success) {
          localStorage.setItem('sessionToken', result.sessionToken);
          onAuthSuccess?.(publicKey.toString());
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
    disconnect();
  };

  if (!connected) {
    return (
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
        <button
          onClick={handleConnect}
          disabled={connecting}
          className="relative bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-700 hover:to-cyan-600 text-white px-8 py-4 rounded-2xl font-black text-lg tracking-wide transition-all duration-500 flex items-center space-x-4 shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {connecting ? (
            <>
              <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <span>CONNECTING...</span>
            </>
          ) : (
            <>
              <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z"/>
                </svg>
              </div>
              <span>CONNECT WALLET</span>
            </>
          )}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-400 to-cyan-300 rounded-b-2xl transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
        </button>
      </div>
    );
  }

  if (!localStorage.getItem('sessionToken')) {
    return (
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
        <button
          onClick={handleAuthenticate}
          disabled={authenticating}
          className="relative bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white px-8 py-4 rounded-2xl font-black text-lg tracking-wide transition-all duration-500 flex items-center space-x-4 shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {authenticating ? (
            <>
              <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <span>AUTHENTICATING...</span>
            </>
          ) : (
            <>
              <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <span>SIGN IN</span>
            </>
          )}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-400 to-cyan-300 rounded-b-2xl transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-6">
      {/* Futuristic Wallet Info */}
      <div className="hidden md:flex items-center space-x-4 relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-cyan-400/20 rounded-2xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="relative bg-gray-900/60 backdrop-blur-xl rounded-2xl px-6 py-3 border border-purple-500/30 shadow-xl">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z"/>
              </svg>
            </div>
            <div className="text-white font-mono text-sm tracking-wider">
              {publicKey ? `${publicKey.toString().slice(0, 8)}...${publicKey.toString().slice(-8)}` : ''}
            </div>
          </div>
        </div>
      </div>

      {/* Futuristic Disconnect Button */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-orange-400/20 rounded-2xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <button
          onClick={handleDisconnect}
          className="relative bg-gray-900/60 backdrop-blur-xl hover:bg-gray-800/60 text-gray-300 hover:text-white px-6 py-3 rounded-2xl font-bold transition-all duration-500 flex items-center space-x-3 border border-gray-700/50 hover:border-red-500/30 shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5"
        >
          <div className="w-5 h-5 bg-red-500/20 rounded-lg flex items-center justify-center">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </div>
          <span className="font-mono tracking-wider text-xs">DISCONNECT</span>
        </button>
      </div>
    </div>
  );
}