'use client';

import React, { useState, useEffect } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { PublicKey } from '@solana/web3.js';
import { encryptMessageForWallet } from '@/lib/encryption';

interface SendMessageProps {
  onMessageSent?: () => void;
  recipientAddress?: string;
}

export default function SendMessage({ onMessageSent, recipientAddress: initialRecipient }: SendMessageProps) {
  const { publicKey } = useWallet();
  const [recipientAddress, setRecipientAddress] = useState(initialRecipient || '');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (initialRecipient) {
      setRecipientAddress(initialRecipient);
    }
  }, [initialRecipient]);

  const validateWalletAddress = (address: string): boolean => {
    try {
      new PublicKey(address);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!publicKey) {
      setError('Wallet not connected');
      return;
    }

    if (!recipientAddress.trim()) {
      setError('Recipient address required');
      return;
    }

    if (!validateWalletAddress(recipientAddress)) {
      setError('Invalid wallet address');
      return;
    }

    if (!message.trim()) {
      setError('Message required');
      return;
    }

    setSending(true);
    setError(null);
    setSuccess(false);

    try {
      // Chiffrer le message avec la nouvelle méthode
      const encrypted = encryptMessageForWallet(message, recipientAddress, publicKey.toString());
      
      // Envoyer le message chiffré au serveur
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('sessionToken')}`
        },
        body: JSON.stringify({
          fromWallet: publicKey.toString(),
          toWallet: recipientAddress,
          ciphertext: encrypted.ciphertext,
          nonce: encrypted.nonce,
          ephPub: encrypted.ephPub,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(true);
        setRecipientAddress('');
        setMessage('');
        onMessageSent?.();
        
        // Reset success state after 3 seconds
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(result.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Error sending message');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="p-6 h-full flex flex-col">
      <form onSubmit={handleSubmit} className="flex flex-col h-full">
        {/* To Field */}
        <div className="mb-6">
          <label htmlFor="recipient" className="block text-sm font-semibold text-white mb-2">
            To
          </label>
          <div className="relative">
            <input
              type="text"
              id="recipient"
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
              placeholder="Enter recipient wallet address..."
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-cyan-400 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z"/>
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Message Field */}
        <div className="flex-1 mb-6">
          <label htmlFor="message" className="block text-sm font-semibold text-white mb-2">
            Message
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your encrypted message here..."
            rows={12}
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300 resize-none"
          />
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-xl">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-red-400 text-sm">{error}</span>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-500/20 border border-green-500/30 rounded-xl">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-green-400 text-sm">Message sent successfully!</span>
            </div>
          </div>
        )}

        {/* Send Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={sending || !message.trim() || !recipientAddress.trim()}
            className="bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-700 hover:to-cyan-600 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {sending ? (
              <>
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Sending...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                <span>Send Message</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Security Info */}
      <div className="mt-6 p-4 bg-gray-800/30 rounded-xl border border-gray-700/50">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-1">End-to-End Encrypted</h4>
            <p className="text-xs text-gray-400">
              Your message is encrypted with the recipient's wallet signature. Only they can decrypt and read it.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}