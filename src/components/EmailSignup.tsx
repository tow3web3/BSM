'use client';

import React, { useState } from 'react';
import { useWallet } from '@/contexts/WalletContext';

interface EmailSignupProps {
  className?: string;
  variant?: 'hero' | 'footer' | 'modal';
}

export default function EmailSignup({ className = '', variant = 'hero' }: EmailSignupProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const { publicKey } = useWallet();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setMessage({ type: 'error', text: 'Please enter your email address' });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage({ type: 'error', text: 'Please enter a valid email address' });
      return;
    }

    setLoading(true);
    setMessage(null);

    // Simulate API call delay
    setTimeout(() => {
      setMessage({ type: 'success', text: 'Email saved! We\'ll notify you when the extension is ready.' });
      setEmail('');
      setLoading(false);
    }, 1000);
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'hero':
        return {
          container: 'bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-yellow-500/20',
          input: 'w-full px-6 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent',
          button: 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-yellow-500/25',
          title: 'text-2xl font-bold text-white mb-4',
          description: 'text-gray-300 mb-6'
        };
      case 'footer':
        return {
          container: 'bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700/50',
          input: 'w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent',
          button: 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black px-6 py-3 rounded-lg font-medium transition-all duration-300',
          title: 'text-lg font-semibold text-white mb-3',
          description: 'text-gray-400 mb-4 text-sm'
        };
      case 'modal':
        return {
          container: 'bg-gray-800 border border-gray-700 rounded-xl p-6',
          input: 'w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent',
          button: 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black px-6 py-3 rounded-lg font-medium transition-all duration-300',
          title: 'text-xl font-bold text-white mb-4',
          description: 'text-gray-300 mb-6'
        };
      default:
        return {
          container: 'bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-yellow-500/20',
          input: 'w-full px-6 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent',
          button: 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-yellow-500/25',
          title: 'text-2xl font-bold text-white mb-4',
          description: 'text-gray-300 mb-6'
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className={`${styles.container} ${className}`}>
      <h3 className={styles.title}>
        Get notified when available
      </h3>
      <p className={styles.description}>
        Be the first to know when our browser extension launches.
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            className={styles.input}
            required
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading}
            className={styles.button}
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Subscribing...</span>
              </div>
            ) : (
              'Subscribe'
            )}
          </button>
        </div>
        
        {message && (
          <div className={`text-sm font-medium ${
            message.type === 'success' 
              ? 'text-green-400' 
              : 'text-red-400'
          }`}>
            {message.text}
          </div>
        )}
      </form>
      
      <p className="text-xs text-gray-500 mt-3">
        We respect your privacy. Unsubscribe at any time.
      </p>
    </div>
  );
}
