'use client';

import React, { useState, useEffect } from 'react';
import WalletButton from '@/components/WalletButton';
import MessageList from '@/components/MessageList';
import SendMessage from '@/components/SendMessage';

export default function Home() {
  const [authenticatedWallet, setAuthenticatedWallet] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'inbox' | 'compose' | 'sent'>('inbox');
  const [sentMessages, setSentMessages] = useState<any[]>([]);
  const [replyToAddress, setReplyToAddress] = useState<string>('');

  const handleAuthSuccess = async (publicKey: string) => {
    setAuthenticatedWallet(publicKey);
    // Envoyer un message de bienvenue automatique
    await sendWelcomeMessage(publicKey);
  };

  const sendWelcomeMessage = async (walletAddress: string) => {
    try {
      const response = await fetch('/api/welcome', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('sessionToken')}`
        },
        body: JSON.stringify({
          toWallet: walletAddress
        })
      });

      if (response.ok) {
        console.log('Welcome message sent successfully');
      }
    } catch (error) {
      console.error('Failed to send welcome message:', error);
    }
  };

  const fetchSentMessages = async () => {
    if (!authenticatedWallet) return;
    
    try {
      const response = await fetch(`/api/messages/sent?wallet=${authenticatedWallet}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sessionToken')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSentMessages(data);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des messages envoyés:', error);
    }
  };

  const handleMessageSent = () => {
    setActiveTab('sent');
    fetchSentMessages();
    setReplyToAddress(''); // Reset reply address
  };

  const handleReply = (fromWallet: string) => {
    setReplyToAddress(fromWallet);
    setActiveTab('compose');
  };

  useEffect(() => {
    if (activeTab === 'sent' && authenticatedWallet) {
      fetchSentMessages();
    }
  }, [activeTab, authenticatedWallet]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-500/20 to-cyan-400/20 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-cyan-500/20 to-purple-400/20 rounded-full blur-3xl animate-pulse-slow" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-green-500/10 to-purple-500/10 rounded-full blur-2xl animate-pulse-slow" style={{animationDelay: '4s'}}></div>
      </div>
      {/* Futuristic Header */}
      <header className="relative bg-black/10 backdrop-blur-xl border-b border-purple-500/30 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-cyan-400/5"></div>
        <div className="relative flex justify-between items-center py-4 px-6">
          <div className="flex items-center space-x-6">
            {/* Futuristic Logo with Holographic Effect */}
            <div className="flex items-center group">
              <div className="w-10 h-10 flex items-center justify-center">
                <img 
                  src="https://i.imgur.com/CT3BB9h.png" 
                  alt="SolanaMail Logo" 
                  className="w-8 h-8 object-contain"
                />
              </div>
              <div className="ml-4">
                <h1 className="text-2xl font-semibold text-white tracking-tight">
                  SolanaMail
                </h1>
                <div className="text-xs text-gray-400 font-mono">SECURE MESSAGING</div>
              </div>
            </div>
            
            {/* Search Bar */}
            <div className="hidden md:flex items-center">
              <div className="bg-gray-800 border border-gray-700 px-4 py-2 w-96">
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input 
                    type="text" 
                    placeholder="Search messages..." 
                    className="bg-transparent text-sm text-white placeholder-gray-400 focus:outline-none flex-1"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Wallet Button */}
          <WalletButton onAuthSuccess={handleAuthSuccess} />
        </div>
      </header>

      {/* Futuristic Layout */}
      <div className="flex relative">
        {/* Futuristic Sidebar */}
        <div className="w-80 relative bg-black/5 backdrop-blur-2xl border-r border-purple-500/30 min-h-screen shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 via-transparent to-cyan-400/5"></div>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-400"></div>
          <div className="relative p-8">
            {!authenticatedWallet ? (
              <div className="text-center py-16">
                <div className="mb-8">
                  <div className="w-16 h-16 flex items-center justify-center mx-auto">
                    <img 
                      src="https://i.imgur.com/CT3BB9h.png" 
                      alt="SolanaMail Logo" 
                      className="w-14 h-14 object-contain"
                    />
                  </div>
                </div>
                <h2 className="text-xl font-semibold text-white mb-3">
                  Secure Messaging
                </h2>
                <p className="text-sm text-gray-400 mb-6">
                  End-to-end encrypted messaging with Solana wallets
                </p>
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-center">
                    <div className="w-2 h-2 bg-gray-500 mr-3"></div>
                    <span className="text-gray-400">Encrypted Messages</span>
                  </div>
                  <div className="flex items-center justify-center">
                    <div className="w-2 h-2 bg-gray-500 mr-3"></div>
                    <span className="text-gray-400">Wallet Authentication</span>
                  </div>
                  <div className="flex items-center justify-center">
                    <div className="w-2 h-2 bg-gray-500 mr-3"></div>
                    <span className="text-gray-400">Phantom Integration</span>
                  </div>
                  <div className="flex items-center justify-center">
                    <div className="w-2 h-2 bg-gray-500 mr-3"></div>
                    <span className="text-gray-400">Secure Storage</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Compose Button */}
                <button
                  onClick={() => setActiveTab('compose')}
                  className="w-full bg-gray-800 border border-gray-700 text-white px-6 py-3 font-medium hover:bg-gray-700 transition-colors flex items-center justify-center mb-6"
                >
                  <div className="flex items-center space-x-3">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span>Compose</span>
                  </div>
                </button>

                {/* Inbox Button */}
                <button
                  onClick={() => setActiveTab('inbox')}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === 'inbox'
                      ? 'bg-gray-700 text-white border border-gray-600'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white border border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-6 h-6 flex items-center justify-center ${
                      activeTab === 'inbox' 
                        ? 'bg-gray-600' 
                        : 'bg-gray-700'
                    }`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                    </div>
                    <span>Inbox</span>
                  </div>
                </button>

                {/* Sent Button */}
                <button
                  onClick={() => setActiveTab('sent')}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === 'sent'
                      ? 'bg-gray-700 text-white border border-gray-600'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white border border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-6 h-6 flex items-center justify-center ${
                      activeTab === 'sent' 
                        ? 'bg-gray-600' 
                        : 'bg-gray-700'
                    }`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </div>
                    <span>Sent</span>
                  </div>
                </button>

                {/* Wallet Info */}
                <div className="mt-8 p-4 bg-gray-800 border border-gray-700">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-8 h-8 bg-gray-700 flex items-center justify-center">
                      <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">Wallet Connected</div>
                      <div className="text-xs text-gray-400">Secure</div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-400 bg-gray-900 p-2 border border-gray-700">
                    {authenticatedWallet ? `${authenticatedWallet.slice(0, 8)}...${authenticatedWallet.slice(-8)}` : ''}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 bg-black/5 backdrop-blur-sm">
          {!authenticatedWallet ? (
            <div className="flex items-center justify-center min-h-screen py-12">
              <div className="text-center max-w-4xl mx-auto px-6">
                {/* Hero Section */}
                <div className="mb-16">
                  <div className="relative mb-8">
                    <div className="w-32 h-32 flex items-center justify-center mx-auto">
                      <img 
                        src="https://i.imgur.com/CT3BB9h.png" 
                        alt="SolanaMail Logo" 
                        className="w-24 h-24 object-contain"
                      />
                    </div>
                  </div>
                  
                  <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">
                    SolanaMail
                  </h1>
                  <p className="text-xl text-gray-300 mb-3 font-medium">
                    Secure Blockchain Messaging
                  </p>
                  <p className="text-base text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
                    Send encrypted messages using your Solana wallet address. Your wallet is your identity - no registration required.
                  </p>
                </div>

                {/* Features Grid */}
                <div className="grid md:grid-cols-3 gap-6 mb-16">
                  <div className="bg-gray-800/40 border border-gray-700/50 p-6 hover:border-gray-600/50 transition-all duration-200">
                    <div className="w-12 h-12 bg-gray-700 flex items-center justify-center mx-auto mb-4">
                      <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-3">Wallet Authentication</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      Connect with your Solana wallet. No passwords or usernames required.
                    </p>
                  </div>

                  <div className="bg-gray-800/40 border border-gray-700/50 p-6 hover:border-gray-600/50 transition-all duration-200">
                    <div className="w-12 h-12 bg-gray-700 flex items-center justify-center mx-auto mb-4">
                      <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-3">End-to-End Encryption</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      Messages are encrypted locally. Only you and the recipient can read them.
                    </p>
                  </div>

                  <div className="bg-gray-800/40 border border-gray-700/50 p-6 hover:border-gray-600/50 transition-all duration-200">
                    <div className="w-12 h-12 bg-gray-700 flex items-center justify-center mx-auto mb-4">
                      <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-3">Fast & Secure</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      Built on Solana blockchain for speed and reliability.
                    </p>
                  </div>
                </div>

                {/* How It Works */}
                <div className="bg-gray-800/40 border border-gray-700/50 p-8 mb-16">
                  <h2 className="text-2xl font-semibold text-white mb-8 text-center">How It Works</h2>
                  <div className="grid md:grid-cols-4 gap-6">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-gray-700 flex items-center justify-center mx-auto mb-3 text-white font-semibold text-lg">
                        1
                      </div>
                      <h3 className="text-base font-medium text-white mb-2">Connect Wallet</h3>
                      <p className="text-gray-400 text-sm">Connect your Phantom wallet</p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-gray-700 flex items-center justify-center mx-auto mb-3 text-white font-semibold text-lg">
                        2
                      </div>
                      <h3 className="text-base font-medium text-white mb-2">Share Address</h3>
                      <p className="text-gray-400 text-sm">Share your wallet address</p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-gray-700 flex items-center justify-center mx-auto mb-3 text-white font-semibold text-lg">
                        3
                      </div>
                      <h3 className="text-base font-medium text-white mb-2">Send Messages</h3>
                      <p className="text-gray-400 text-sm">Send encrypted messages</p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-gray-700 flex items-center justify-center mx-auto mb-3 text-white font-semibold text-lg">
                        4
                      </div>
                      <h3 className="text-base font-medium text-white mb-2">Receive Messages</h3>
                      <p className="text-gray-400 text-sm">Decrypt messages in your inbox</p>
                    </div>
                  </div>
                </div>

                {/* Call to Action */}
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-white mb-4">Get Started</h3>
                  <p className="text-gray-400 mb-8 max-w-xl mx-auto">
                    Connect your wallet to start sending encrypted messages.
                  </p>
                  <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-gray-500 mr-2"></div>
                      <span>No Registration</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-gray-500 mr-2"></div>
                      <span>Encrypted</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-gray-500 mr-2"></div>
                      <span>Decentralized</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-full">
              {/* Message List Panel */}
              <div className={`${activeTab === 'inbox' ? 'w-full' : 'hidden'} bg-black/5 backdrop-blur-sm`}>
                <div className="h-full flex flex-col">
                  {/* Inbox Header */}
                  <div className="border-b border-purple-500/20 p-6 bg-black/10 backdrop-blur-lg">
                    <div className="flex items-center justify-between">
                      <h1 className="text-2xl font-bold text-white">Inbox</h1>
                      <div className="flex items-center space-x-4">
                        <button className="text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors">
                          Mark all as read
                        </button>
                        <button className="text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors">
                          Select all
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto">
                    <MessageList walletAddress={authenticatedWallet} onReply={handleReply} />
                  </div>
                </div>
              </div>

              {/* Sent Messages Panel */}
              <div className={`${activeTab === 'sent' ? 'w-full' : 'hidden'} bg-black/5 backdrop-blur-sm`}>
                <div className="h-full flex flex-col">
                  {/* Sent Header */}
                  <div className="border-b border-purple-500/20 p-6 bg-black/10 backdrop-blur-lg">
                    <div className="flex items-center justify-between">
                      <h1 className="text-2xl font-bold text-white">Sent Messages</h1>
                      <div className="flex items-center space-x-4">
                        <button 
                          onClick={fetchSentMessages}
                          className="text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors"
                        >
                          Refresh
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Sent Messages List */}
                  <div className="flex-1 overflow-y-auto p-6">
                    {sentMessages.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-800 border border-gray-700 flex items-center justify-center mx-auto mb-4">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-medium text-white mb-2">No sent messages</h3>
                        <p className="text-gray-400 mb-6">You haven't sent any messages yet.</p>
                        <button
                          onClick={() => setActiveTab('compose')}
                          className="bg-gray-800 border border-gray-700 text-white px-6 py-3 font-medium hover:bg-gray-700 transition-colors"
                        >
                          Send your first message
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {sentMessages.map((message, index) => (
                          <div key={index} className="bg-gray-800 border border-gray-700 p-4 hover:border-gray-600 transition-colors">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <div className="text-sm font-medium text-white">To: {message.toWallet.slice(0, 8)}...{message.toWallet.slice(-8)}</div>
                                <div className="text-xs text-gray-400">{new Date(message.createdAt).toLocaleString()}</div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-xs text-gray-500 bg-gray-700 px-2 py-1">Sent</span>
                              </div>
                            </div>
                            <div className="text-sm text-gray-300">
                              Message encrypted and sent successfully
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Compose Panel */}
              <div className={`${activeTab === 'compose' ? 'w-full' : 'hidden'} bg-black/5 backdrop-blur-sm`}>
                <div className="h-full flex flex-col">
                  {/* Compose Header */}
                  <div className="border-b border-purple-500/20 p-6 bg-black/10 backdrop-blur-lg">
                    <div className="flex items-center justify-between">
                      <h1 className="text-2xl font-bold text-white">Compose</h1>
                      <button
                        onClick={() => setActiveTab('inbox')}
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  {/* Compose Form */}
                  <div className="flex-1 overflow-y-auto">
                    <SendMessage onMessageSent={handleMessageSent} recipientAddress={replyToAddress} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}