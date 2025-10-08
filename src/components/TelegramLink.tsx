'use client';

import React, { useState, useEffect } from 'react';
import { useWallet } from '@/contexts/WalletContext';

export default function TelegramLink() {
  const { address } = useWallet();
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLinked, setIsLinked] = useState(false);
  const [telegramUsername, setTelegramUsername] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Check if wallet is already linked
  useEffect(() => {
    if (address) {
      checkLinkStatus();
    }
  }, [address]);

  const checkLinkStatus = async () => {
    if (!address) return;

    try {
      const response = await fetch(`/api/telegram/link?wallet=${address}`);
      const data = await response.json();
      
      setIsLinked(data.linked);
      setTelegramUsername(data.telegramUsername);
    } catch (err) {
      console.error('Error checking Telegram link status:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!address) {
      setError('Please connect your wallet first');
      return;
    }

    if (!verificationCode.trim() || verificationCode.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/telegram/link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: address,
          verificationCode: verificationCode.trim()
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSuccess(true);
        setVerificationCode('');
        setIsLinked(true);
        setTelegramUsername(result.telegramUsername);
        
        setTimeout(() => {
          setShowModal(false);
          setSuccess(false);
        }, 3000);
      } else {
        setError(result.error || 'Failed to link Telegram');
      }
    } catch (err) {
      console.error('Error linking Telegram:', err);
      setError('Failed to link Telegram account');
    } finally {
      setLoading(false);
    }
  };

  if (!address) return null;

  return (
    <>
      {/* Telegram Link Button in Sidebar */}
      <div className="mt-4">
        <button
          onClick={() => setShowModal(true)}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
            isLinked
              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
              : 'bg-gray-800/50 text-gray-400 border border-gray-700/50 hover:bg-gray-800 hover:border-yellow-500/30 hover:text-yellow-400'
          }`}
        >
          <div className="flex items-center space-x-3">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18.717-.962 3.792-1.362 5.031-.168.525-.502.7-.826.717-.7.064-1.232-.463-1.91-.908-1.061-.696-1.659-1.128-2.689-1.808-.119-.079-.238-.157-.356-.236-.502-.333-.886-.554-.343-1.24.157-.2 2.874-2.634 2.925-2.859.006-.028.012-.133-.05-.188s-.137-.036-.196-.022c-.084.02-1.409.896-3.982 2.633-.378.26-.721.388-.998.382-.329-.007-.96-.186-1.43-.339-.576-.188-1.033-.287-993-.262.188-1.254.624-1.848 1.31zm0 0"/>
            </svg>
            <div className="flex-1 text-left">
              <div className="font-semibold">
                {isLinked ? '✅ Telegram Linked' : 'Link Telegram'}
              </div>
              {isLinked && telegramUsername && (
                <div className="text-xs text-gray-400">@{telegramUsername}</div>
              )}
            </div>
          </div>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <>
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            onClick={() => setShowModal(false)}
          />
          
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
            <div className="bg-gradient-to-br from-gray-900 to-black border border-yellow-500/30 rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-yellow-600/5 rounded-2xl pointer-events-none"></div>
              
              <div className="relative">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl md:text-2xl font-bold text-white">
                    {isLinked ? '📱 Telegram Linked' : '🔗 Link Telegram'}
                  </h3>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {isLinked ? (
                  // Already linked view
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-green-500/20 border border-green-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-green-400 font-semibold mb-2">Telegram Connected!</p>
                    {telegramUsername && (
                      <p className="text-gray-400 text-sm mb-6">@{telegramUsername}</p>
                    )}
                    <p className="text-gray-300 text-sm mb-6">
                      You'll receive instant notifications for new messages.
                    </p>
                    <button
                      onClick={() => setShowModal(false)}
                      className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black px-6 py-3 rounded-xl font-semibold transition-all duration-300"
                    >
                      Close
                    </button>
                  </div>
                ) : (
                  // Link form
                  <>
                    <div className="mb-6">
                      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-4">
                        <p className="text-sm text-blue-300">
                          <strong>📱 Step 1:</strong> Open Telegram and find your BSM bot
                        </p>
                      </div>
                      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-4">
                        <p className="text-sm text-blue-300">
                          <strong>🔐 Step 2:</strong> Send <code className="bg-black/40 px-2 py-1 rounded">/link</code> to get your code
                        </p>
                      </div>
                      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                        <p className="text-sm text-yellow-300">
                          <strong>✨ Step 3:</strong> Enter the 6-digit code below
                        </p>
                      </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-white mb-2">
                          Verification Code
                        </label>
                        <input
                          type="text"
                          value={verificationCode}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                            setVerificationCode(value);
                          }}
                          placeholder="123456"
                          maxLength={6}
                          className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white text-center text-2xl font-mono tracking-widest placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/50 transition-all duration-300"
                          autoComplete="off"
                        />
                        <p className="text-xs text-gray-400 mt-2 text-center">
                          Enter the 6-digit code from Telegram
                        </p>
                      </div>

                      {error && (
                        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-xl">
                          <p className="text-red-400 text-sm">{error}</p>
                        </div>
                      )}

                      {success && (
                        <div className="mb-4 p-3 bg-green-500/20 border border-green-500/30 rounded-xl">
                          <p className="text-green-400 text-sm">
                            ✅ Successfully linked! You'll receive notifications.
                          </p>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={loading || verificationCode.length !== 6}
                        className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      >
                        {loading ? 'Verifying...' : 'Link Telegram'}
                      </button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-gray-800">
                      <p className="text-xs text-gray-400 text-center">
                        🔒 Secure verification ensures only you can link your wallet
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

