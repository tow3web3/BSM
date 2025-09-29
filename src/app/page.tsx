'use client';

import React, { useState, useEffect, useCallback } from 'react';
import WalletButton from '@/components/WalletButton';
import MessageList from '@/components/MessageList';
import SendMessage from '@/components/SendMessage';
import ContactBook from '@/components/ContactBook';
import EmailSignup from '@/components/EmailSignup';

export default function Home() {
  const [authenticatedWallet, setAuthenticatedWallet] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'inbox' | 'compose' | 'sent' | 'contacts'>('inbox');
  const [sentMessages, setSentMessages] = useState<Array<{id: string; toWallet: string; createdAt: string}>>([]);
  const [replyToAddress, setReplyToAddress] = useState<string>('');
  const [showPlaneAnimation, setShowPlaneAnimation] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedContactAddress, setSelectedContactAddress] = useState<string>('');

  // Ensure we're on client side before accessing localStorage
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Loading screen timer
  useEffect(() => {
    const loadingTimer = setTimeout(() => {
      setIsLoading(false);
    }, 3000); // Show loading for 3 seconds

    return () => clearTimeout(loadingTimer);
  }, []);

  // Scroll detection for reveal animations
  useEffect(() => {
    if (!isClient) return;

    const handleScroll = () => {
      const revealElements = document.querySelectorAll('.scroll-reveal:not(.revealed), .scroll-reveal-left:not(.revealed), .scroll-reveal-right:not(.revealed), .scroll-reveal-scale:not(.revealed)');
      
      revealElements.forEach((element) => {
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;
        
        if (elementTop < window.innerHeight - elementVisible) {
          element.classList.add('revealed');
          
          // Add staggered reveal for child elements
          const children = element.querySelectorAll('.stagger-child');
          children.forEach((child, index) => {
            setTimeout(() => {
              child.classList.add('revealed');
            }, index * 150);
          });
        }
      });
    };

    // Initial check
    handleScroll();

    // Add scroll listener
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [isClient]);

  const handleAuthSuccess = async (publicKey: string) => {
    setAuthenticatedWallet(publicKey);
    // Envoyer un message de bienvenue automatique
    await sendWelcomeMessage(publicKey);
  };

  const sendWelcomeMessage = async (walletAddress: string) => {
    if (!isClient) return;
    
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

  const fetchSentMessages = useCallback(async () => {
    if (!authenticatedWallet || !isClient) return;
    
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
  }, [authenticatedWallet, isClient]);

  const handleMessageSent = () => {
    setActiveTab('sent');
    fetchSentMessages();
    setReplyToAddress(''); // Reset reply address
    setSelectedContactAddress(''); // Reset selected contact
  };

  const handleReply = (fromWallet: string) => {
    setReplyToAddress(fromWallet);
    setActiveTab('compose');
  };

  const handleSelectContact = (address: string) => {
    setSelectedContactAddress(address);
    setActiveTab('compose');
  };

  const handleDeleteSentMessage = async (messageId: string) => {
    if (!confirm('Are you sure you want to delete this sent message? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/messages/${messageId}?wallet=${authenticatedWallet}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete message');
      }

      // Remove message from local state
      setSentMessages(prev => prev.filter(msg => msg.id !== messageId));
    } catch (error) {
      console.error('Error deleting sent message:', error);
      alert(error instanceof Error ? error.message : 'Failed to delete message');
    }
  };

  const handleLogoClick = () => {
    // Reset to home state - show the landing page instead of the app
    setActiveTab('inbox');
    setReplyToAddress('');
    setSelectedContactAddress('');
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    if (activeTab === 'sent' && authenticatedWallet) {
      fetchSentMessages();
    }
  }, [activeTab, authenticatedWallet, fetchSentMessages]);

  // Loading Screen
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-gray-900 to-slate-950 flex flex-col items-center justify-center z-50">
        {/* Logo */}
        <div className="mb-16">
              <img 
                src="/ChatGPT_Image_11_sept._2025_16_17_59.png" 
                alt="SolanaMail Logo" 
                className="w-16 h-16 mx-auto"
              />
        </div>

        {/* Thin Loading Bar */}
        <div className="w-64">
          <div className="h-0.5 bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full animate-progress-fill"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-900 to-slate-950 relative overflow-hidden">
      {/* Modern Parallax Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Primary floating orb */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-gradient-to-br from-purple-500/15 to-cyan-400/15 rounded-full blur-3xl animate-parallax-float"></div>
        
        {/* Secondary orb */}
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-gradient-to-tr from-cyan-500/10 to-purple-400/10 rounded-full blur-3xl animate-parallax-float animation-delay-400"></div>
        
        {/* Accent orb */}
        <div className="absolute top-1/3 right-1/4 w-48 h-48 bg-gradient-to-r from-purple-500/8 to-cyan-500/8 rounded-full blur-2xl animate-parallax-float animation-delay-800"></div>
        
        {/* Grid overlay for depth */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:100px_100px] opacity-20"></div>
      </div>
      {/* Modern Header */}
      <header className="relative glass-modern border-b border-white/5 shadow-2xl animate-fade-in-down opacity-0">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/3 via-transparent to-cyan-400/3"></div>
        <div className="relative flex justify-between items-center py-6 px-8">
          <div className="flex items-center space-x-6">
            {/* Futuristic Logo with Holographic Effect */}
            <button 
              onClick={handleLogoClick}
              className="flex items-center group hover:opacity-80 transition-opacity duration-200 cursor-pointer"
            >
              <div className="w-16 h-16 flex items-center justify-center">
                <img 
                  src="/ChatGPT_Image_11_sept._2025_16_17_59.png" 
                  alt="SolanaMail Logo" 
                  className="w-14 h-14 object-contain group-hover:scale-105 transition-transform duration-200"
                />
              </div>
              <div className="ml-4">
                <h1 className="text-2xl font-semibold text-white tracking-tight group-hover:text-cyan-300 transition-colors duration-200">
                  SolanaMail
                </h1>
                <div className="text-xs text-gray-400 font-mono group-hover:text-cyan-400 transition-colors duration-200">SECURE MESSAGING</div>
              </div>
            </button>
            
            {/* Paper Plane Animation */}
            <div className="hidden md:flex items-center space-x-4">
              <button
                onClick={() => setShowPlaneAnimation(!showPlaneAnimation)}
                className="relative group bg-gray-800 border border-gray-700 px-4 py-2 hover:border-gray-600 transition-colors"
              >
                <div className="flex items-center">
                  <div className="w-6 h-6 text-gray-400 mr-3 group-hover:text-cyan-400 transition-colors">
                    <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                    </svg>
                  </div>
                  <span className="text-sm text-gray-400 group-hover:text-white transition-colors">Contract Address</span>
                </div>
              </button>
              
              {/* Follow Us Button */}
              <a
                href="https://x.com/SolanaMailweb3"
            target="_blank"
            rel="noopener noreferrer"
                className="relative group bg-gray-800 border border-gray-700 px-4 py-2 hover:border-gray-600 transition-colors"
              >
                <div className="flex items-center">
                  <div className="w-6 h-6 text-gray-400 mr-3 group-hover:text-cyan-400 transition-colors">
                    <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </div>
                  <span className="text-sm text-gray-400 group-hover:text-white transition-colors">Follow Us</span>
                </div>
              </a>
              
              {/* Puzzle Icon for Sneak Peek */}
              <button
                onClick={() => {
                  const sneakPeekSection = document.getElementById('sneak-peek');
                  if (sneakPeekSection) {
                    sneakPeekSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="relative group p-2 rounded-lg hover:bg-purple-500/10 transition-all duration-300 hover:scale-110"
                title="View Browser Extension Sneak Peek"
              >
                <div className="w-7 h-7 text-gray-400 group-hover:text-purple-400 transition-all duration-300 group-hover:drop-shadow-lg">
                  <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 011-1h1a2 2 0 100-4H7a1 1 0 01-1-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
                  </svg>
                </div>
              </button>
            </div>
          </div>

          {/* Wallet Button */}
          <div data-wallet-button>
            <WalletButton onAuthSuccess={handleAuthSuccess} />
          </div>
        </div>
      </header>

      {/* Futuristic Layout */}
      <div className="flex relative">
        {/* Modern Sidebar */}
        <div className="w-80 relative glass-modern border-r border-white/5 min-h-screen animate-slide-in-left">
          <div className="absolute inset-0 bg-gradient-to-b from-purple-500/2 via-transparent to-cyan-400/2"></div>
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-purple-500/50 via-cyan-400/50 to-purple-500/50 animate-gradient-move"></div>
          <div className="relative p-8">
            {!authenticatedWallet ? (
              <div className="text-center py-16">
                <div className="mb-8">
                  <div className="w-16 h-16 flex items-center justify-center mx-auto">
                    <img 
                      src="/d5963c6f0bc206e3723f796e3b54fd6b.gif" 
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

                {/* Contacts Button */}
                <button
                  onClick={() => setActiveTab('contacts')}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === 'contacts'
                      ? 'bg-gray-700 text-white border border-gray-600'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white border border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-6 h-6 flex items-center justify-center ${
                      activeTab === 'contacts' 
                        ? 'bg-gray-600' 
                        : 'bg-gray-700'
                    }`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <span>Contacts</span>
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
        <div className="flex-1 glass-modern backdrop-blur-sm">
          {!authenticatedWallet ? (
            <div className="flex items-center justify-center min-h-screen py-16">
              <div className="text-center max-w-5xl mx-auto px-8">
                {/* Hero Section */}
                <div className="mb-24">
                  <div className="relative mb-12 animate-scale-in opacity-0">
                    <div className="w-40 h-40 flex items-center justify-center mx-auto relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 rounded-full blur-2xl animate-pulse"></div>
                      <img 
                        src="/ChatGPT_Image_11_sept._2025_16_17_59.png" 
                        alt="SolanaMail Logo" 
                        className="w-32 h-32 object-contain relative z-10"
                      />
                    </div>
                  </div>
                  
                  <h1 className="text-6xl font-bold text-white mb-6 tracking-tight animate-fade-in-up animation-delay-200 opacity-0">
                    SolanaMail
                  </h1>
                  <p className="text-2xl text-gray-300 mb-4 font-light animate-fade-in-up animation-delay-400 opacity-0">
                    Secure Blockchain Messaging
                  </p>
                  <p className="text-lg text-gray-400 mb-8 max-w-3xl mx-auto leading-relaxed animate-fade-in-up animation-delay-600 opacity-0">
                    Send encrypted messages using your Solana wallet address. Your wallet is your identity - no registration required.
                  </p>
                  
                  {/* Message Button */}
                  <div className="animate-fade-in-up animation-delay-800 opacity-0">
                    {authenticatedWallet ? (
                      <button
                        onClick={() => setActiveTab('compose')}
                        className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-purple-500/25"
                      >
                        <div className="flex items-center space-x-3">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          <span>Start Messaging</span>
                        </div>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          // Scroll to wallet button or trigger wallet connection
                          const walletButton = document.querySelector('[data-wallet-button]');
                          if (walletButton) {
                            walletButton.scrollIntoView({ behavior: 'smooth' });
                          }
                        }}
                        className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-purple-500/25"
                      >
                        <div className="flex items-center space-x-3">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                          <span>Connect Wallet & Start Messaging</span>
                        </div>
                      </button>
                    )}
                  </div>
                </div>

                {/* Features - Alternating Layout */}
                <div className="space-y-32 mb-24">
                  {/* Feature 1 - Left aligned */}
                  <div className="flex items-center justify-between max-w-6xl mx-auto">
                    <div className="flex-1 scroll-reveal-left">
                      <div className="max-w-lg">
                        <div className="flex items-center gap-4 mb-6">
                          <div className="w-20 h-20 bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-3xl flex items-center justify-center animate-glow-pulse stagger-child scroll-reveal-scale">
                            <svg className="w-10 h-10 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                          <div className="h-px flex-1 bg-gradient-to-r from-purple-500/30 to-transparent stagger-child scroll-reveal"></div>
                        </div>
                        <h3 className="text-3xl font-bold text-white mb-6 stagger-child scroll-reveal">Wallet Authentication</h3>
                        <p className="text-xl text-gray-400 leading-relaxed mb-6 stagger-child scroll-reveal">
                      Connect with your Solana wallet. No passwords or usernames required.
                    </p>
                        <div className="flex items-center gap-3 text-purple-400 stagger-child scroll-reveal">
                          <span className="text-sm font-medium">One-click connection</span>
                          <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 scroll-reveal-right reveal-delay-300">
                      <div className="relative ml-16">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent rounded-3xl blur-2xl"></div>
                        <div className="relative card-modern p-8 border-l-4 border-purple-500/50 animate-smooth-float">
                          <div className="text-sm text-purple-300 mb-2 stagger-child scroll-reveal">✓ Secure</div>
                          <div className="text-sm text-purple-300 mb-2 stagger-child scroll-reveal">✓ Fast</div>
                          <div className="text-sm text-purple-300 stagger-child scroll-reveal">✓ No Registration</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Feature 2 - Right aligned */}
                  <div className="flex items-center justify-between max-w-6xl mx-auto">
                    <div className="flex-1 scroll-reveal-left reveal-delay-200">
                      <div className="relative mr-16">
                        <div className="absolute inset-0 bg-gradient-to-l from-cyan-500/10 to-transparent rounded-3xl blur-2xl"></div>
                        <div className="relative card-modern p-8 border-r-4 border-cyan-500/50 animate-smooth-float">
                          <div className="text-sm text-cyan-300 mb-2 stagger-child scroll-reveal">🔒 Local Encryption</div>
                          <div className="text-sm text-cyan-300 mb-2 stagger-child scroll-reveal">🔐 Private Keys</div>
                          <div className="text-sm text-cyan-300 stagger-child scroll-reveal">🛡️ Zero Knowledge</div>
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 scroll-reveal-right">
                      <div className="max-w-lg ml-auto text-right">
                        <div className="flex items-center justify-end gap-4 mb-6">
                          <div className="h-px flex-1 bg-gradient-to-l from-cyan-500/30 to-transparent stagger-child scroll-reveal"></div>
                          <div className="w-20 h-20 bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 border border-cyan-500/30 rounded-3xl flex items-center justify-center animate-glow-pulse stagger-child scroll-reveal-scale">
                            <svg className="w-10 h-10 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                          </div>
                        </div>
                        <h3 className="text-3xl font-bold text-white mb-6 stagger-child scroll-reveal">End-to-End Encryption</h3>
                        <p className="text-xl text-gray-400 leading-relaxed mb-6 stagger-child scroll-reveal">
                      Messages are encrypted locally. Only you and the recipient can read them.
                    </p>
                        <div className="flex items-center justify-end gap-3 text-cyan-400 stagger-child scroll-reveal">
                          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                          <span className="text-sm font-medium">Military-grade security</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Feature 3 - Left aligned */}
                  <div className="flex items-center justify-between max-w-6xl mx-auto">
                    <div className="flex-1 scroll-reveal-left">
                      <div className="max-w-lg">
                        <div className="flex items-center gap-4 mb-6">
                          <div className="w-20 h-20 bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-3xl flex items-center justify-center animate-glow-pulse stagger-child scroll-reveal-scale">
                            <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                          <div className="h-px flex-1 bg-gradient-to-r from-green-500/30 to-transparent stagger-child scroll-reveal"></div>
                        </div>
                        <h3 className="text-3xl font-bold text-white mb-6 stagger-child scroll-reveal">Lightning Fast</h3>
                        <p className="text-xl text-gray-400 leading-relaxed mb-6 stagger-child scroll-reveal">
                      Built on Solana blockchain for speed and reliability.
                    </p>
                        <div className="flex items-center gap-3 text-green-400 stagger-child scroll-reveal">
                          <span className="text-sm font-medium">Sub-second delivery</span>
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 scroll-reveal-right reveal-delay-300">
                      <div className="relative ml-16">
                        <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-transparent rounded-3xl blur-2xl"></div>
                        <div className="relative card-modern p-8 border-l-4 border-green-500/50 animate-smooth-float">
                          <div className="text-sm text-green-300 mb-2 stagger-child scroll-reveal">⚡ 65,000 TPS</div>
                          <div className="text-sm text-green-300 mb-2 stagger-child scroll-reveal">🌍 Global Network</div>
                          <div className="text-sm text-green-300 stagger-child scroll-reveal">💰 Low Fees</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Browser Extension Sneak Peek */}
                <div id="sneak-peek" className="card-modern p-12 mb-24 relative overflow-hidden scroll-reveal-scale reveal-delay-200">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-cyan-500/5"></div>
                  <div className="relative">
                    <div className="text-center mb-12">
                      <div className="inline-flex items-center gap-3 bg-purple-500/10 border border-purple-500/20 text-purple-300 px-6 py-3 rounded-full text-sm font-medium mb-6 stagger-child scroll-reveal">
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                        Coming Soon
                      </div>
                      <h2 className="text-4xl font-bold text-white mb-6 stagger-child scroll-reveal">Browser Extension</h2>
                      <p className="text-xl text-gray-300 mb-4 font-light stagger-child scroll-reveal">Access SolanaMail directly from your browser</p>
                      <p className="text-gray-400 max-w-3xl mx-auto text-lg leading-relaxed stagger-child scroll-reveal">
                        Get instant notifications, quick compose, and seamless wallet integration without leaving your current tab.
                      </p>
                    </div>
                    
                    <div className="flex justify-center mb-8">
                      <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="relative bg-black/40 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-6 hover:border-purple-500/40 transition-all duration-300">
                          <img 
                            src="/screen.png" 
                            alt="SolanaMail Browser Extension Preview" 
                            className="w-full max-w-lg mx-auto rounded-xl shadow-2xl"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Get Notified Button */}
                    <div className="text-center mb-8">
                      <EmailSignup variant="hero" />
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 mb-8">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-purple-500/20 border border-purple-500/30 rounded-xl flex items-center justify-center mx-auto mb-4">
                          <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-5 5v-5z"></path>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7H4l5-5v5z"></path>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 3v4a1 1 0 001 1h4"></path>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 21v-7a1 1 0 00-1-1h-4"></path>
                          </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">Quick Access</h3>
                        <p className="text-gray-400 text-sm">Access your messages from any website with one click</p>
                      </div>
                      <div className="text-center">
                        <div className="w-12 h-12 bg-cyan-500/20 border border-cyan-500/30 rounded-xl flex items-center justify-center mx-auto mb-4">
                          <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-5 5v-5z"></path>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7H4l5-5v5z"></path>
                          </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">Real-time Notifications</h3>
                        <p className="text-gray-400 text-sm">Get notified instantly when you receive new messages</p>
                      </div>
                      <div className="text-center">
                        <div className="w-12 h-12 bg-green-500/20 border border-green-500/30 rounded-xl flex items-center justify-center mx-auto mb-4">
                          <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                          </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">Secure Integration</h3>
                        <p className="text-gray-400 text-sm">Same encryption and security as the web app</p>
                      </div>
                    </div>

                  </div>
                </div>

                {/* How It Works - Dynamic Steps */}
                <div className="mb-24">
                  <h2 className="text-4xl font-bold text-white mb-16 text-center scroll-reveal">How It Works</h2>
                  
                  <div className="space-y-24 max-w-6xl mx-auto">
                    {/* Step 1 - Left aligned */}
                    <div className="flex items-center justify-between">
                      <div className="flex-1 scroll-reveal-left">
                        <div className="max-w-lg">
                          <div className="flex items-center gap-6 mb-8">
                            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-xl">
                              1
                            </div>
                            <div className="h-px flex-1 bg-gradient-to-r from-purple-500/50 to-transparent"></div>
                          </div>
                          <h3 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h3>
                          <p className="text-lg text-gray-400 mb-6">
                            Connect your Phantom or Solana wallet to get started with secure messaging.
                          </p>
                          <div className="flex items-center gap-3 text-purple-400">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                            <span className="text-sm">One-click connection</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex-1 scroll-reveal-right reveal-delay-300">
                        <div className="ml-16">
                          <div className="card-modern p-8 border-l-4 border-purple-500/50">
                            <div className="text-purple-300 text-sm mb-2">🔗 Phantom Wallet</div>
                            <div className="text-purple-300 text-sm mb-2">🔗 Solflare Wallet</div>
                            <div className="text-purple-300 text-sm">🔗 Other Solana Wallets</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Step 2 - Right aligned */}
                    <div className="flex items-center justify-between">
                      <div className="flex-1 scroll-reveal-left reveal-delay-200">
                        <div className="mr-16">
                          <div className="card-modern p-8 border-r-4 border-cyan-500/50">
                            <div className="text-cyan-300 text-sm mb-2">💰 Get $SM Tokens</div>
                            <div className="text-cyan-300 text-sm mb-2">📈 DEX Integration</div>
                            <div className="text-cyan-300 text-sm">🎯 Premium Features</div>
                          </div>
                        </div>
                      </div>
                      <div className="flex-1 scroll-reveal-right">
                        <div className="max-w-lg ml-auto text-right">
                          <div className="flex items-center justify-end gap-6 mb-8">
                            <div className="h-px flex-1 bg-gradient-to-l from-cyan-500/50 to-transparent"></div>
                            <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-xl">
                              2
                            </div>
                          </div>
                          <h3 className="text-2xl font-bold text-white mb-4">Purchase $SM Token</h3>
                          <p className="text-lg text-gray-400 mb-6">
                            Get $SM tokens to unlock premium features and enhanced messaging capabilities.
                          </p>
                          <div className="flex items-center justify-end gap-3 text-cyan-400">
                            <span className="text-sm">Available on DEX</span>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Step 3 - Left aligned */}
                    <div className="flex items-center justify-between">
                      <div className="flex-1 scroll-reveal-left">
                        <div className="max-w-lg">
                          <div className="flex items-center gap-6 mb-8">
                            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-xl">
                              3
                            </div>
                            <div className="h-px flex-1 bg-gradient-to-r from-green-500/50 to-transparent"></div>
                          </div>
                          <h3 className="text-2xl font-bold text-white mb-4">Send Encrypted Messages</h3>
                          <p className="text-lg text-gray-400 mb-6">
                            Compose and send end-to-end encrypted messages to any Solana wallet address.
                          </p>
                          <div className="flex items-center gap-3 text-green-400">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                            </svg>
                            <span className="text-sm">End-to-end encrypted</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex-1 scroll-reveal-right reveal-delay-300">
                        <div className="ml-16">
                          <div className="card-modern p-8 border-l-4 border-green-500/50">
                            <div className="text-green-300 text-sm mb-2">📝 Rich Text Support</div>
                            <div className="text-green-300 text-sm mb-2">🔐 AES-256 Encryption</div>
                            <div className="text-green-300 text-sm">⚡ Instant Delivery</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Step 4 - Right aligned */}
                    <div className="flex items-center justify-between">
                      <div className="flex-1 scroll-reveal-left reveal-delay-200">
                        <div className="mr-16">
                          <div className="card-modern p-8 border-r-4 border-orange-500/50">
                            <div className="text-orange-300 text-sm mb-2">📬 Instant Notifications</div>
                            <div className="text-orange-300 text-sm mb-2">🔓 Auto Decryption</div>
                            <div className="text-orange-300 text-sm">📱 Cross-Platform</div>
                          </div>
                        </div>
                      </div>
                      <div className="flex-1 scroll-reveal-right">
                        <div className="max-w-lg ml-auto text-right">
                          <div className="flex items-center justify-end gap-6 mb-8">
                            <div className="h-px flex-1 bg-gradient-to-l from-orange-500/50 to-transparent"></div>
                            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-xl">
                              4
                            </div>
                          </div>
                          <h3 className="text-2xl font-bold text-white mb-4">Receive & Decrypt</h3>
                          <p className="text-lg text-gray-400 mb-6">
                            Receive encrypted messages in your inbox and decrypt them securely with your wallet.
                          </p>
                          <div className="flex items-center justify-end gap-3 text-orange-400">
                            <span className="text-sm">Auto-decrypt with wallet</span>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
                            </svg>
                          </div>
                        </div>
                      </div>
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
                    <MessageList 
                      walletAddress={authenticatedWallet} 
                      onReply={handleReply} 
                      onMessageDeleted={() => {
                        // Optionally refresh messages or show a notification
                        console.log('Message deleted');
                      }}
                    />
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
                        <p className="text-gray-400 mb-6">You haven&apos;t sent any messages yet.</p>
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
                          <div key={message.id} className="bg-gray-800 border border-gray-700 p-4 hover:border-gray-600 transition-colors group">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <div className="text-sm font-medium text-white">To: {message.toWallet.slice(0, 8)}...{message.toWallet.slice(-8)}</div>
                                <div className="text-xs text-gray-400">{new Date(message.createdAt).toLocaleString()}</div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-xs text-gray-500 bg-gray-700 px-2 py-1">Sent</span>
                                <button
                                  onClick={() => handleDeleteSentMessage(message.id)}
                                  className="text-gray-400 hover:text-red-400 text-xs font-medium transition-colors opacity-0 group-hover:opacity-100"
                                  title="Delete message"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
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

              {/* Contacts Panel */}
              <div className={`${activeTab === 'contacts' ? 'w-full' : 'hidden'} bg-black/5 backdrop-blur-sm`}>
                <div className="h-full flex flex-col">
                  {/* Contacts Header */}
                  <div className="border-b border-purple-500/20 p-6 bg-black/10 backdrop-blur-lg">
                    <div className="flex items-center justify-between">
                      <h1 className="text-2xl font-bold text-white">Contacts</h1>
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
                  
                  {/* Contacts Content */}
                  <div className="flex-1 overflow-y-auto">
                    <ContactBook onSelectContact={handleSelectContact} />
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
                    <SendMessage 
                      onMessageSent={handleMessageSent} 
                      recipientAddress={replyToAddress || selectedContactAddress} 
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Paper Plane Animation */}
      {showPlaneAnimation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="relative">
            {/* Flying Paper Plane */}
            <div className="absolute -top-20 -left-20 animate-fly-plane">
              <div className="w-8 h-8 text-cyan-400 transform rotate-45">
                <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                </svg>
              </div>
            </div>

            {/* Contract Address Display */}
            <div className="bg-gray-900 border border-cyan-400/50 rounded-2xl p-8 max-w-2xl mx-auto backdrop-blur-xl">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-white mb-6">Contract Address</h3>
                
                {/* Animated Text */}
                <div className="relative">
                  <div className="text-lg font-mono text-cyan-400 tracking-wider animate-typewriter">
                    CA: TBA
                  </div>
                  
                  {/* Cursor Animation */}
                  <div className="inline-block w-2 h-6 bg-cyan-400 ml-1 animate-blink"></div>
                </div>

                {/* Copy Button */}
                <button
                  onClick={() => {
                    navigator.clipboard.writeText('TBA');
                    // You could add a toast notification here
                  }}
                  className="mt-6 bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center mx-auto"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy Address
                </button>

                {/* Close Button */}
                <button
                  onClick={() => setShowPlaneAnimation(false)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}