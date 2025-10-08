'use client';

import React, { useState, useEffect, useCallback } from 'react';
import WalletButton from '@/components/WalletButton';
import MessageList from '@/components/MessageList';
import SendMessage from '@/components/SendMessage';
import ContactBook from '@/components/ContactBook';
import EmailSignup from '@/components/EmailSignup';
import SecurityNotice from '@/components/SecurityNotice';
import TelegramLink from '@/components/TelegramLink';
import { useWallet } from '@/contexts/WalletContext';

export default function Home() {
  const { connected } = useWallet();
  const [authenticatedWallet, setAuthenticatedWallet] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'inbox' | 'compose' | 'sent' | 'contacts'>('inbox');
  const [sentMessages, setSentMessages] = useState<Array<{id: string; toWallet: string; createdAt: string}>>([]);
  const [replyToAddress, setReplyToAddress] = useState<string>('');
  const [showPlaneAnimation, setShowPlaneAnimation] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedContactAddress, setSelectedContactAddress] = useState<string>('');
  const [sidebarOpen, setSidebarOpen] = useState(true); // Start with sidebar open on desktop
  const [copiedContract, setCopiedContract] = useState(false);

  // Ensure we're on client side before accessing localStorage
  useEffect(() => {
    setIsClient(true);
    // Check if user has existing session
    const sessionToken = localStorage.getItem('sessionToken');
    const storedWallet = localStorage.getItem('walletAddress');
    if (sessionToken && storedWallet) {
      setAuthenticatedWallet(storedWallet);
    }
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
    // Store wallet address in localStorage for persistence
    localStorage.setItem('walletAddress', publicKey);
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
    setSidebarOpen(false); // Close sidebar on mobile
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

  const [showHomepage, setShowHomepage] = useState(false);

  const handleLogoClick = () => {
    // Return to homepage but keep user logged in
    setShowHomepage(true);
    setReplyToAddress('');
    setSelectedContactAddress('');
    setSidebarOpen(false);
    // Scroll to top to show landing page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTabChange = (tab: 'inbox' | 'compose' | 'sent' | 'contacts') => {
    setActiveTab(tab);
    setSidebarOpen(false); // Close sidebar on mobile
  };

  useEffect(() => {
    if (activeTab === 'sent' && authenticatedWallet) {
      fetchSentMessages();
    }
  }, [activeTab, authenticatedWallet, fetchSentMessages]);

  // Watch for wallet disconnection and return to homepage
  useEffect(() => {
    if (!connected && authenticatedWallet) {
      // Wallet was disconnected, clear auth and return to homepage
      setAuthenticatedWallet(null);
      setActiveTab('inbox');
      setReplyToAddress('');
      setSelectedContactAddress('');
      setSidebarOpen(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [connected, authenticatedWallet]);

  // Loading Screen
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-black via-gray-950 to-black flex flex-col items-center justify-center z-50">
        {/* Logo */}
        <div className="mb-16">
              <img 
                src="/BSM.png" 
                alt="Binance Smart Mail Logo" 
                className="w-16 h-16 mx-auto"
              />
        </div>

        {/* Thin Loading Bar */}
        <div className="w-64">
          <div className="h-0.5 bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full animate-progress-fill"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black relative overflow-hidden w-full">
      {/* Modern Parallax Background - Binance Style */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Primary floating orb */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-gradient-to-br from-yellow-500/15 to-yellow-600/15 rounded-full blur-3xl animate-parallax-float"></div>
        
        {/* Secondary orb */}
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-gradient-to-tr from-yellow-500/10 to-amber-500/10 rounded-full blur-3xl animate-parallax-float animation-delay-400"></div>
        
        {/* Accent orb */}
        <div className="absolute top-1/3 right-1/4 w-48 h-48 bg-gradient-to-r from-yellow-500/8 to-amber-500/8 rounded-full blur-2xl animate-parallax-float animation-delay-800"></div>
        
        {/* Grid overlay for depth */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(240,185,11,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(240,185,11,0.02)_1px,transparent_1px)] bg-[size:100px_100px] opacity-20"></div>
      </div>
      {/* Modern Header */}
      <header className="fixed top-0 left-0 right-0 glass-modern border-b border-yellow-500/10 shadow-2xl animate-fade-in-down opacity-0 z-50 backdrop-blur-md">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 via-transparent to-yellow-600/5"></div>
        <div className="relative flex justify-between items-center py-3 md:py-4 px-3 md:px-6">
          <div className="flex items-center space-x-3 md:space-x-6">
            {/* Futuristic Logo with Holographic Effect */}
            <button 
              onClick={handleLogoClick}
              className="flex items-center group hover:opacity-80 transition-opacity duration-200 cursor-pointer"
            >
              <div className="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center flex-shrink-0">
                <img 
                  src="/BSM.png" 
                  alt="Binance Smart Mail Logo" 
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
                  style={{ maxWidth: '100%', maxHeight: '100%' }}
                />
              </div>
              <div className="ml-2 md:ml-4 hidden md:block">
                <div className="flex items-center gap-2">
                  <h1 className="text-lg md:text-2xl font-semibold text-white tracking-tight group-hover:text-yellow-300 transition-colors duration-200">
                    Binance Smart Mail
                  </h1>
                  <span className="px-2 py-0.5 text-[10px] font-bold text-yellow-500 bg-yellow-500/10 border border-yellow-500/30 rounded tracking-wider">
                    v0.1
                  </span>
                </div>
                <div className="text-xs text-gray-400 font-mono group-hover:text-yellow-400 transition-colors duration-200">SECURE MESSAGING</div>
              </div>
            </button>
            
            {/* Paper Plane Animation */}
            <div className="hidden md:flex items-center space-x-4">
              <button
                onClick={() => setShowPlaneAnimation(!showPlaneAnimation)}
                className="relative group bg-gray-900/80 border border-gray-800 px-4 py-2 hover:border-yellow-500/30 transition-colors"
              >
                <div className="flex items-center">
                  <div className="w-6 h-6 text-gray-400 mr-3 group-hover:text-yellow-500 transition-colors">
                    <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                    </svg>
                  </div>
                  <span className="text-sm text-gray-400 group-hover:text-white transition-colors">Contract Address</span>
                </div>
              </button>
              
              {/* Follow Us Button */}
              <a
                href="https://x.com/bsmartmail"
            target="_blank"
            rel="noopener noreferrer"
                className="relative group bg-gray-900/80 border border-gray-800 px-4 py-2 hover:border-yellow-500/30 transition-colors"
              >
                <div className="flex items-center">
                  <div className="w-6 h-6 text-gray-400 mr-3 group-hover:text-yellow-500 transition-colors">
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
                className="relative group p-2 rounded-lg hover:bg-yellow-500/10 transition-all duration-300 hover:scale-110"
                title="View Browser Extension Sneak Peek"
              >
                <div className="w-7 h-7 text-gray-400 group-hover:text-yellow-500 transition-all duration-300 group-hover:drop-shadow-lg">
                  <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 011-1h1a2 2 0 100-4H7a1 1 0 01-1-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
                  </svg>
                </div>
              </button>
            </div>
          </div>

          {/* Enter App Button + Wallet Button */}
          <div className="flex items-center gap-3">
            {/* Show Enter App button when user is authenticated and viewing homepage */}
            {authenticatedWallet && showHomepage && (
              <button
                onClick={() => {
                  setShowHomepage(false);
                  setActiveTab('inbox');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black px-3 md:px-4 py-2 rounded-lg font-medium text-xs md:text-sm transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                <span className="hidden sm:inline">Enter App</span>
                <span className="sm:hidden">Enter</span>
              </button>
            )}
            
            <div data-wallet-button>
              <WalletButton onAuthSuccess={handleAuthSuccess} />
            </div>
          </div>
        </div>
      </header>

      {/* Futuristic Layout */}
      <div className="flex relative mt-16 md:mt-[73px]">
        {/* Sidebar Toggle Button - Always Visible (Desktop Only) */}
        <button
          onClick={() => {
            console.log('Toggle button clicked! Current state:', sidebarOpen, 'Auth:', authenticatedWallet);
            setSidebarOpen(!sidebarOpen);
          }}
          className={`hidden md:flex fixed bottom-8 z-[999] bg-gradient-to-r from-yellow-500 to-yellow-600 border-2 border-yellow-400 px-3 py-6 hover:from-yellow-600 hover:to-yellow-700 transition-all duration-300 shadow-2xl hover:shadow-yellow-500/50 items-center justify-center cursor-pointer ${
            sidebarOpen ? 'left-[304px] rounded-r-2xl' : 'left-0 rounded-r-2xl'
          }`}
          title={sidebarOpen ? "Hide Sidebar" : "Show Sidebar"}
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {sidebarOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            )}
          </svg>
        </button>

        {/* Mobile Menu Button */}
        {authenticatedWallet && (
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="fixed top-4 left-4 z-50 md:hidden bg-gray-800 border border-gray-700 p-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}

        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-[35] md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Modern Sidebar */}
        <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed md:fixed top-[64px] md:top-[73px] left-0 z-[45] w-80 h-[calc(100vh-64px)] md:h-[calc(100vh-73px)] glass-modern border-r border-white/5 transition-transform duration-300 ease-in-out overflow-y-auto bg-gray-900/95 md:bg-transparent`}>
          <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/2 via-transparent to-yellow-600/2"></div>
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-yellow-500/50 via-yellow-600/50 to-yellow-500/50 animate-gradient-move"></div>
          <div className="relative p-8 pt-12">

            {!authenticatedWallet ? (
              <div className="text-center py-16">
                <div className="mb-8">
                  <div className="w-16 h-16 flex items-center justify-center mx-auto">
                    <img 
                      src="/BSM.png" 
                      alt="Binance Smart Mail Logo" 
                      className="w-14 h-14 object-contain"
                    />
                  </div>
                </div>
                <h2 className="text-xl font-semibold text-white mb-3">
                  Secure Messaging
                </h2>
                <p className="text-sm text-gray-400 mb-6">
                  End-to-end encrypted messaging with BSC wallets
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
                    <span className="text-gray-400">MetaMask Integration</span>
                  </div>
                  <div className="flex items-center justify-center">
                    <div className="w-2 h-2 bg-gray-500 mr-3"></div>
                    <span className="text-gray-400">Secure Storage</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                {/* Compose Button */}
                <button
                  onClick={() => handleTabChange('compose')}
                  className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black px-6 py-4 font-semibold rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-yellow-500/30 flex items-center justify-center mb-6"
                >
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span className="text-base">New Message</span>
                  </div>
                </button>

                {/* Menu Divider */}
                <div className="mb-4 pb-2">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">Navigation</div>
                </div>

                {/* Inbox Button */}
                <button
                  onClick={() => handleTabChange('inbox')}
                  className={`w-full flex items-center px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-300 mb-2 ${
                    activeTab === 'inbox'
                      ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 shadow-lg shadow-yellow-500/10'
                      : 'text-gray-400 hover:bg-gray-800/50 hover:text-yellow-500 border border-transparent hover:border-gray-700/50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      activeTab === 'inbox' 
                        ? 'bg-yellow-500/30' 
                        : 'bg-gray-800/50'
                    }`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                    </div>
                    <span>Inbox</span>
                  </div>
                </button>

                {/* Sent Button */}
                <button
                  onClick={() => handleTabChange('sent')}
                  className={`w-full flex items-center px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-300 mb-2 ${
                    activeTab === 'sent'
                      ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 shadow-lg shadow-yellow-500/10'
                      : 'text-gray-400 hover:bg-gray-800/50 hover:text-yellow-500 border border-transparent hover:border-gray-700/50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      activeTab === 'sent' 
                        ? 'bg-yellow-500/30' 
                        : 'bg-gray-800/50'
                    }`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </div>
                    <span>Sent</span>
                  </div>
                </button>

                {/* Contacts Button */}
                <button
                  onClick={() => handleTabChange('contacts')}
                  className={`w-full flex items-center px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-300 mb-2 ${
                    activeTab === 'contacts'
                      ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 shadow-lg shadow-yellow-500/10'
                      : 'text-gray-400 hover:bg-gray-800/50 hover:text-yellow-500 border border-transparent hover:border-gray-700/50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      activeTab === 'contacts' 
                        ? 'bg-yellow-500/30' 
                        : 'bg-gray-800/50'
                    }`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <span>Contacts</span>
                  </div>
                </button>

                {/* Wallet Info */}
                <div className="mt-8 p-5 bg-gradient-to-br from-gray-900/80 to-black/80 border border-yellow-500/20 rounded-xl backdrop-blur-sm">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">Wallet Connected</div>
                      <div className="text-xs text-yellow-500 flex items-center gap-1">
                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                        Secure
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-400 bg-black/40 p-3 border border-gray-800 rounded-lg font-mono">
                    {authenticatedWallet ? `${authenticatedWallet.slice(0, 8)}...${authenticatedWallet.slice(-8)}` : ''}
                  </div>
                </div>

                {/* Telegram Link Component */}
                <TelegramLink />
              </div>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className={`flex-1 glass-modern backdrop-blur-sm transition-all duration-300 ${sidebarOpen ? 'md:ml-80' : 'md:ml-0'} ml-0 min-h-screen`}>
          {/* Mobile Header */}
          {authenticatedWallet && !showHomepage && (
            <div className="md:hidden bg-black/20 backdrop-blur-sm border-b border-gray-700 p-3 md:p-4">
              <div className="flex items-center justify-between">
                <h1 className="text-base md:text-lg font-semibold text-white capitalize">
                  {activeTab === 'inbox' ? 'Inbox' : 
                   activeTab === 'compose' ? 'Compose' :
                   activeTab === 'sent' ? 'Sent Messages' :
                   activeTab === 'contacts' ? 'Contacts' : activeTab}
                </h1>
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          )}
          {!authenticatedWallet || showHomepage ? (
            <div className="flex items-center justify-center min-h-screen py-8 md:py-16">
              <div className="text-center max-w-5xl mx-auto px-4 md:px-8">
                {/* Hero Section */}
                <div className="mb-12 md:mb-24">
                  <div className="relative mb-6 md:mb-8 animate-scale-in opacity-0">
                    <div className="w-48 h-48 md:w-56 md:h-56 flex items-center justify-center mx-auto relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 rounded-full blur-2xl animate-pulse"></div>
                      <img 
                        src="/BSM.png" 
                        alt="Binance Smart Mail Logo" 
                        className="w-40 h-40 md:w-48 md:h-48 object-contain relative z-10"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-center gap-3 mb-4 md:mb-6">
                    <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight animate-fade-in-up animation-delay-200 opacity-0">
                      Binance Smart Mail
                    </h1>
                    <span className="px-3 py-1 text-xs md:text-sm font-bold text-yellow-500 bg-yellow-500/10 border border-yellow-500/30 rounded-lg tracking-wider animate-fade-in-up animation-delay-200 opacity-0">
                      v0.1
                    </span>
                  </div>
                  <p className="text-xl md:text-2xl text-gray-300 mb-3 md:mb-4 font-light animate-fade-in-up animation-delay-400 opacity-0">
                    Secure Blockchain Messaging
                  </p>
                  <p className="text-base md:text-lg text-gray-400 mb-6 md:mb-8 max-w-3xl mx-auto leading-relaxed animate-fade-in-up animation-delay-600 opacity-0">
                    Send encrypted messages using your BSC wallet address. Your wallet is your identity - no registration required.
                  </p>
                  
                  {/* Message Button */}
                  {authenticatedWallet && (
                    <div className="animate-fade-in-up animation-delay-800 opacity-0">
                      <button
                        onClick={() => {
                          setShowHomepage(false);
                          setActiveTab('inbox');
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-yellow-500/25"
                      >
                        <div className="flex items-center space-x-3">
                          <img 
                            src="/BSM.png" 
                            alt="Binance Smart Mail" 
                            className="w-8 h-8 object-contain"
                          />
                          <span>Start Messaging</span>
                        </div>
                      </button>
                    </div>
                  )}
                </div>

                {/* Features - Alternating Layout */}
                <div className="space-y-16 md:space-y-32 mb-24 px-4">
                  {/* Feature 1 - Left aligned on desktop, stacked on mobile */}
                  <div className="flex flex-col md:flex-row items-center justify-between max-w-6xl mx-auto gap-8 md:gap-0">
                    <div className="w-full md:flex-1 scroll-reveal-left">
                      <div className="max-w-lg mx-auto md:mx-0">
                        <div className="flex items-center gap-4 mb-6">
                          <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 rounded-3xl flex items-center justify-center animate-glow-pulse stagger-child scroll-reveal-scale flex-shrink-0">
                            <svg className="w-8 h-8 md:w-10 md:h-10 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                          <div className="h-px flex-1 bg-gradient-to-r from-yellow-500/30 to-transparent stagger-child scroll-reveal"></div>
                        </div>
                        <h3 className="text-2xl md:text-3xl font-bold text-white mb-4 md:mb-6 stagger-child scroll-reveal">Wallet Authentication</h3>
                        <p className="text-lg md:text-xl text-gray-400 leading-relaxed mb-4 md:mb-6 stagger-child scroll-reveal">
                      Connect with your BSC wallet. No passwords or usernames required.
                    </p>
                        <div className="flex items-center gap-3 text-yellow-500 stagger-child scroll-reveal">
                          <span className="text-sm font-medium">One-click connection</span>
                          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                        </div>
                      </div>
                    </div>
                    <div className="w-full md:flex-1 scroll-reveal-right reveal-delay-300">
                      <div className="relative md:ml-16">
                        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-transparent rounded-3xl blur-2xl"></div>
                        <div className="relative card-modern p-6 md:p-8 border-l-4 border-yellow-500/50 animate-smooth-float">
                          <div className="text-sm text-yellow-300 mb-2 stagger-child scroll-reveal">✓ Secure</div>
                          <div className="text-sm text-yellow-300 mb-2 stagger-child scroll-reveal">✓ Fast</div>
                          <div className="text-sm text-yellow-300 stagger-child scroll-reveal">✓ No Registration</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Feature 2 - Right aligned on desktop, stacked on mobile */}
                  <div className="flex flex-col md:flex-row items-center justify-between max-w-6xl mx-auto gap-8 md:gap-0">
                    <div className="w-full md:flex-1 order-2 md:order-1 scroll-reveal-left reveal-delay-200">
                      <div className="relative md:mr-16">
                        <div className="absolute inset-0 bg-gradient-to-l from-yellow-500/10 to-transparent rounded-3xl blur-2xl"></div>
                        <div className="relative card-modern p-6 md:p-8 border-r-4 border-yellow-500/50 animate-smooth-float">
                          <div className="text-sm text-yellow-300 mb-2 stagger-child scroll-reveal">🔒 Local Encryption</div>
                          <div className="text-sm text-yellow-300 mb-2 stagger-child scroll-reveal">🔐 Private Keys</div>
                          <div className="text-sm text-yellow-300 stagger-child scroll-reveal">🛡️ Zero Knowledge</div>
                        </div>
                      </div>
                    </div>
                    <div className="w-full md:flex-1 order-1 md:order-2 scroll-reveal-right">
                      <div className="max-w-lg mx-auto md:ml-auto md:text-right">
                        <div className="flex items-center md:justify-end gap-4 mb-6">
                          <div className="h-px flex-1 bg-gradient-to-l from-yellow-500/30 to-transparent stagger-child scroll-reveal hidden md:block"></div>
                          <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 rounded-3xl flex items-center justify-center animate-glow-pulse stagger-child scroll-reveal-scale flex-shrink-0">
                            <svg className="w-8 h-8 md:w-10 md:h-10 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                          </div>
                          <div className="h-px flex-1 bg-gradient-to-r from-yellow-500/30 to-transparent stagger-child scroll-reveal md:hidden"></div>
                        </div>
                        <h3 className="text-2xl md:text-3xl font-bold text-white mb-4 md:mb-6 stagger-child scroll-reveal">End-to-End Encryption</h3>
                        <p className="text-lg md:text-xl text-gray-400 leading-relaxed mb-4 md:mb-6 stagger-child scroll-reveal">
                      Messages are encrypted locally. Only you and the recipient can read them.
                    </p>
                        <div className="flex items-center md:justify-end gap-3 text-yellow-500 stagger-child scroll-reveal">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                          <span className="text-sm font-medium">End-to-end encrypted</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Feature 3 - Left aligned on desktop, stacked on mobile */}
                  <div className="flex flex-col md:flex-row items-center justify-between max-w-6xl mx-auto gap-8 md:gap-0">
                    <div className="w-full md:flex-1 scroll-reveal-left">
                      <div className="max-w-lg mx-auto md:mx-0">
                        <div className="flex items-center gap-4 mb-6">
                          <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 rounded-3xl flex items-center justify-center animate-glow-pulse stagger-child scroll-reveal-scale flex-shrink-0">
                            <svg className="w-8 h-8 md:w-10 md:h-10 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                          <div className="h-px flex-1 bg-gradient-to-r from-yellow-500/30 to-transparent stagger-child scroll-reveal"></div>
                        </div>
                        <h3 className="text-2xl md:text-3xl font-bold text-white mb-4 md:mb-6 stagger-child scroll-reveal">Lightning Fast</h3>
                        <p className="text-lg md:text-xl text-gray-400 leading-relaxed mb-4 md:mb-6 stagger-child scroll-reveal">
                      Built on Binance Smart Chain for speed and reliability.
                    </p>
                        <div className="flex items-center gap-3 text-yellow-500 stagger-child scroll-reveal">
                          <span className="text-sm font-medium">Fast confirmation times</span>
                          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                        </div>
                      </div>
                    </div>
                    <div className="w-full md:flex-1 scroll-reveal-right reveal-delay-300">
                      <div className="relative md:ml-16">
                        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-transparent rounded-3xl blur-2xl"></div>
                        <div className="relative card-modern p-6 md:p-8 border-l-4 border-yellow-500/50 animate-smooth-float">
                          <div className="text-sm text-yellow-300 mb-2 stagger-child scroll-reveal">⚡ 3-Second Blocks</div>
                          <div className="text-sm text-yellow-300 mb-2 stagger-child scroll-reveal">🌍 Global Network</div>
                          <div className="text-sm text-yellow-300 stagger-child scroll-reveal">💰 Low Gas Fees</div>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Browser Extension Sneak Peek */}
                <div id="sneak-peek" className="card-modern p-6 md:p-12 mb-16 md:mb-24 relative overflow-hidden scroll-reveal-scale reveal-delay-200 mx-4">
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-yellow-600/5"></div>
                  <div className="relative">
                    <div className="text-center mb-8 md:mb-12">
                      <div className="inline-flex items-center gap-3 bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 px-4 md:px-6 py-2 md:py-3 rounded-full text-xs md:text-sm font-medium mb-4 md:mb-6 stagger-child scroll-reveal">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                        Coming Soon
                      </div>
                      <h2 className="text-2xl md:text-4xl font-bold text-white mb-4 md:mb-6 stagger-child scroll-reveal">Browser Extension</h2>
                      <p className="text-lg md:text-xl text-gray-300 mb-3 md:mb-4 font-light stagger-child scroll-reveal">Access Binance Smart Mail directly from your browser</p>
                      <p className="text-gray-400 max-w-3xl mx-auto text-base md:text-lg leading-relaxed stagger-child scroll-reveal px-4">
                        Get instant notifications, quick compose, and seamless wallet integration without leaving your current tab.
                      </p>
                    </div>
                    
                    <div className="flex justify-center mb-6 md:mb-8">
                      <div className="relative group w-full">
                        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="relative bg-black/40 backdrop-blur-sm border border-yellow-500/20 rounded-2xl p-3 md:p-6 hover:border-yellow-500/40 transition-all duration-300">
                          <img 
                            src="/screen.png" 
                            alt="Binance Smart Mail Browser Extension Preview" 
                            className="w-full max-w-lg mx-auto rounded-xl shadow-2xl"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Get Notified Button */}
                    <div className="text-center mb-6 md:mb-8">
                      <EmailSignup variant="hero" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-yellow-500/20 border border-yellow-500/30 rounded-xl flex items-center justify-center mx-auto mb-4">
                          <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                        <div className="w-12 h-12 bg-yellow-500/20 border border-yellow-500/30 rounded-xl flex items-center justify-center mx-auto mb-4">
                          <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-5 5v-5z"></path>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7H4l5-5v5z"></path>
                          </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">Real-time Notifications</h3>
                        <p className="text-gray-400 text-sm">Get notified instantly when you receive new messages</p>
                      </div>
                      <div className="text-center">
                        <div className="w-12 h-12 bg-yellow-500/20 border border-yellow-500/30 rounded-xl flex items-center justify-center mx-auto mb-4">
                          <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                <div className="mb-24 px-4">
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-12 md:mb-16 text-center scroll-reveal">How It Works</h2>
                  
                  <div className="space-y-12 md:space-y-24 max-w-6xl mx-auto">
                    {/* Step 1 - Left aligned on desktop, stacked on mobile */}
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-0">
                      <div className="w-full md:flex-1 scroll-reveal-left">
                        <div className="max-w-lg mx-auto md:mx-0">
                          <div className="flex items-center gap-4 md:gap-6 mb-6 md:mb-8">
                            <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl flex items-center justify-center text-black text-xl md:text-2xl font-bold shadow-xl flex-shrink-0">
                              1
                            </div>
                            <div className="h-px flex-1 bg-gradient-to-r from-yellow-500/50 to-transparent"></div>
                          </div>
                          <h3 className="text-xl md:text-2xl font-bold text-white mb-3 md:mb-4">Connect Your Wallet</h3>
                          <p className="text-base md:text-lg text-gray-400 mb-4 md:mb-6">
                            Connect your MetaMask or BSC wallet to get started with secure messaging.
                          </p>
                          <div className="flex items-center gap-3 text-yellow-400">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                            <span className="text-sm">One-click connection</span>
                          </div>
                        </div>
                      </div>
                      <div className="w-full md:flex-1 scroll-reveal-right reveal-delay-300">
                        <div className="md:ml-16">
                          <div className="card-modern p-6 md:p-8 border-l-4 border-yellow-500/50">
                            <div className="text-yellow-300 text-sm mb-2">🔗 MetaMask</div>
                            <div className="text-yellow-300 text-sm mb-2">🔗 Trust Wallet</div>
                            <div className="text-yellow-300 text-sm">🔗 Other BSC Wallets</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Step 2 - Right aligned on desktop, stacked on mobile */}
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-0">
                      <div className="w-full md:flex-1 order-2 md:order-1 scroll-reveal-left reveal-delay-200">
                        <div className="md:mr-16">
                          <div className="card-modern p-6 md:p-8 border-r-4 border-yellow-500/50">
                            <div className="text-yellow-300 text-sm mb-2">💰 Get $BSM Tokens</div>
                            <div className="text-yellow-300 text-sm mb-2">📈 DEX Integration</div>
                            <div className="text-yellow-300 text-sm">🎯 Premium Features</div>
                          </div>
                        </div>
                      </div>
                      <div className="w-full md:flex-1 order-1 md:order-2 scroll-reveal-right">
                        <div className="max-w-lg mx-auto md:ml-auto md:text-right">
                          <div className="flex items-center md:justify-end gap-4 md:gap-6 mb-6 md:mb-8">
                            <div className="h-px flex-1 bg-gradient-to-l from-yellow-500/50 to-transparent hidden md:block"></div>
                            <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl flex items-center justify-center text-black text-xl md:text-2xl font-bold shadow-xl flex-shrink-0">
                              2
                            </div>
                            <div className="h-px flex-1 bg-gradient-to-r from-yellow-500/50 to-transparent md:hidden"></div>
                          </div>
                          <h3 className="text-xl md:text-2xl font-bold text-white mb-3 md:mb-4">Purchase $BSM Token</h3>
                          <p className="text-base md:text-lg text-gray-400 mb-4 md:mb-6">
                            Get $BSM tokens to unlock premium features and enhanced messaging capabilities.
                          </p>
                          <div className="flex items-center md:justify-end gap-3 text-yellow-500">
                            <span className="text-sm">Available on DEX</span>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Step 3 - Left aligned on desktop, stacked on mobile */}
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-0">
                      <div className="w-full md:flex-1 scroll-reveal-left">
                        <div className="max-w-lg mx-auto md:mx-0">
                          <div className="flex items-center gap-4 md:gap-6 mb-6 md:mb-8">
                            <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl flex items-center justify-center text-black text-xl md:text-2xl font-bold shadow-xl flex-shrink-0">
                              3
                            </div>
                            <div className="h-px flex-1 bg-gradient-to-r from-yellow-500/50 to-transparent"></div>
                          </div>
                          <h3 className="text-xl md:text-2xl font-bold text-white mb-3 md:mb-4">Send Encrypted Messages</h3>
                          <p className="text-base md:text-lg text-gray-400 mb-4 md:mb-6">
                            Compose and send end-to-end encrypted messages to any BSC wallet address.
                          </p>
                          <div className="flex items-center gap-3 text-yellow-500">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                            </svg>
                            <span className="text-sm">End-to-end encrypted</span>
                          </div>
                        </div>
                      </div>
                      <div className="w-full md:flex-1 scroll-reveal-right reveal-delay-300">
                        <div className="md:ml-16">
                          <div className="card-modern p-6 md:p-8 border-l-4 border-yellow-500/50">
                            <div className="text-yellow-300 text-sm mb-2">📝 Rich Text Support</div>
                            <div className="text-yellow-300 text-sm mb-2">🔐 AES-256 Encryption</div>
                            <div className="text-yellow-300 text-sm">⚡ Instant Delivery</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Step 4 - Right aligned on desktop, stacked on mobile */}
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-0">
                      <div className="w-full md:flex-1 order-2 md:order-1 scroll-reveal-left reveal-delay-200">
                        <div className="md:mr-16">
                          <div className="card-modern p-6 md:p-8 border-r-4 border-yellow-500/50">
                            <div className="text-yellow-300 text-sm mb-2">📬 Instant Notifications</div>
                            <div className="text-yellow-300 text-sm mb-2">🔓 Auto Decryption</div>
                            <div className="text-yellow-300 text-sm">📱 Cross-Platform</div>
                          </div>
                        </div>
                      </div>
                      <div className="w-full md:flex-1 order-1 md:order-2 scroll-reveal-right">
                        <div className="max-w-lg mx-auto md:ml-auto md:text-right">
                          <div className="flex items-center md:justify-end gap-4 md:gap-6 mb-6 md:mb-8">
                            <div className="h-px flex-1 bg-gradient-to-l from-yellow-500/50 to-transparent hidden md:block"></div>
                            <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl flex items-center justify-center text-black text-xl md:text-2xl font-bold shadow-xl flex-shrink-0">
                              4
                            </div>
                            <div className="h-px flex-1 bg-gradient-to-r from-yellow-500/50 to-transparent md:hidden"></div>
                          </div>
                          <h3 className="text-xl md:text-2xl font-bold text-white mb-3 md:mb-4">Receive & Decrypt</h3>
                          <p className="text-base md:text-lg text-gray-400 mb-4 md:mb-6">
                            Receive encrypted messages in your inbox and decrypt them securely with your wallet.
                          </p>
                          <div className="flex items-center md:justify-end gap-3 text-yellow-500">
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
                <div className="text-center px-4">
                  <h3 className="text-lg md:text-xl font-semibold text-white mb-3 md:mb-4">Get Started</h3>
                  <p className="text-sm md:text-base text-gray-400 mb-6 md:mb-8 max-w-xl mx-auto">
                    Connect your wallet to start sending encrypted messages.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-xs md:text-sm text-gray-500">
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
            <div className="flex h-full pt-4">
              {/* Message List Panel */}
              <div className={`${activeTab === 'inbox' ? 'w-full' : 'hidden'} bg-black/5 backdrop-blur-sm`}>
                <div className="h-full flex flex-col">
                  {/* Inbox Header */}
                  <div className="border-b border-yellow-500/20 p-4 md:p-6 bg-gradient-to-r from-yellow-500/5 to-transparent backdrop-blur-lg pt-6 md:pt-8">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                          </svg>
                        </div>
                        <h1 className="text-xl md:text-2xl font-bold text-white">Inbox</h1>
                      </div>
                      <div className="flex items-center space-x-2 md:space-x-4">
                        <button className="text-yellow-500 hover:text-yellow-400 text-xs md:text-sm font-medium transition-colors px-3 py-1.5 rounded-lg hover:bg-yellow-500/10">
                          Mark all as read
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
                  <div className="border-b border-yellow-500/20 p-4 md:p-6 bg-gradient-to-r from-yellow-500/5 to-transparent backdrop-blur-lg pt-6 md:pt-8">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                        </div>
                        <h1 className="text-xl md:text-2xl font-bold text-white">Sent Messages</h1>
                      </div>
                      <div className="flex items-center space-x-4">
                        <button 
                          onClick={fetchSentMessages}
                          className="text-yellow-500 hover:text-yellow-400 text-sm font-medium transition-colors px-3 py-1.5 rounded-lg hover:bg-yellow-500/10"
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
                        <div className="w-16 h-16 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                          <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">No sent messages</h3>
                        <p className="text-gray-400 mb-6">You haven&apos;t sent any messages yet.</p>
                        <button
                          onClick={() => handleTabChange('compose')}
                          className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
                        >
                          Send your first message
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {sentMessages.map((message, index) => (
                          <div key={message.id} className="bg-gray-900/50 border border-gray-800 hover:border-yellow-500/30 rounded-xl p-4 transition-all duration-300 group hover:shadow-lg hover:shadow-yellow-500/5">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <div className="text-sm font-medium text-white">To: {message.toWallet.slice(0, 8)}...{message.toWallet.slice(-8)}</div>
                                <div className="text-xs text-gray-400">{new Date(message.createdAt).toLocaleString()}</div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-xs text-yellow-500 bg-yellow-500/10 border border-yellow-500/20 px-2 py-1 rounded">Sent</span>
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
                <div className="h-full flex flex-col pt-4">
                  {/* Contacts Header */}
                  <div className="border-b border-yellow-500/20 p-4 md:p-6 bg-gradient-to-r from-yellow-500/5 to-transparent backdrop-blur-lg pt-6 md:pt-8">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                        <h1 className="text-xl md:text-2xl font-bold text-white">Contacts</h1>
                      </div>
                      <button
                        onClick={() => setActiveTab('inbox')}
                        className="text-gray-400 hover:text-yellow-500 transition-colors p-2 rounded-lg hover:bg-gray-800/50"
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
                <div className="h-full flex flex-col pt-4">
                  {/* Compose Header */}
                  <div className="border-b border-yellow-500/20 p-4 md:p-6 bg-gradient-to-r from-yellow-500/5 to-transparent backdrop-blur-lg pt-6 md:pt-8">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </div>
                        <h1 className="text-xl md:text-2xl font-bold text-white">Compose</h1>
                      </div>
                      <button
                        onClick={() => setActiveTab('inbox')}
                        className="text-gray-400 hover:text-yellow-500 transition-colors p-2 rounded-lg hover:bg-gray-800/50"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  {/* Compose Form */}
                  <div className="flex-1 overflow-y-auto p-2 md:p-4">
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

      {/* Security Notice Modal */}
      <SecurityNotice />

      {/* Paper Plane Animation */}
      {showPlaneAnimation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-2xl">
            {/* Flying Paper Plane */}
            <div className="absolute -top-20 -left-20 animate-fly-plane hidden md:block">
              <div className="w-8 h-8 text-yellow-500 transform rotate-45">
                <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                </svg>
              </div>
            </div>

            {/* Contract Address Display */}
            <div className="bg-gray-900 border border-yellow-500/50 rounded-2xl p-6 md:p-8 backdrop-blur-xl relative">
              <div className="text-center">
                <h3 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6">Contract Address</h3>
                
                {/* Animated Text */}
                <div className="relative mb-6">
                  <div className="text-sm md:text-lg font-mono text-yellow-400 tracking-wider break-all">
                    CA: 0x0000000000000000000000000000000000000000
                  </div>
                </div>

                {/* Copy Button */}
                <button
                  onClick={() => {
                    navigator.clipboard.writeText('0x0000000000000000000000000000000000000000');
                    setCopiedContract(true);
                    setTimeout(() => setCopiedContract(false), 2000);
                  }}
                  className={`w-full md:w-auto px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center justify-center mx-auto ${
                    copiedContract 
                      ? 'bg-green-500 hover:bg-green-600 text-white' 
                      : 'bg-yellow-500 hover:bg-yellow-600 text-black'
                  }`}
                >
                  {copiedContract ? (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy Address
                    </>
                  )}
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