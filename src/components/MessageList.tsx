'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@/contexts/WalletContext';

interface Message {
  id: string;
  fromWallet: string;
  ciphertext: string;
  nonce: string;
  ephPub: string;
  createdAt: string;
}

interface MessageListProps {
  walletAddress: string;
  onReply?: (fromWallet: string) => void;
  onMessageDeleted?: () => void;
}

export default function MessageList({ walletAddress, onReply, onMessageDeleted }: MessageListProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { decryptMessage } = useWallet();
  const [decryptedMessages, setDecryptedMessages] = useState<Record<string, string>>({});
  const [decrypting, setDecrypting] = useState<Record<string, boolean>>({});

  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/messages?wallet=${walletAddress}`);
      const result = await response.json();
      
      if (result.success) {
        setMessages(result.messages);
        setError(null);
      } else {
        setError(result.error);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des messages:', error);
      setError('Error fetching messages');
    } finally {
      setLoading(false);
    }
  }, [walletAddress]);

  useEffect(() => {
    if (walletAddress) {
      fetchMessages();
    }
  }, [walletAddress, fetchMessages]);

  const handleDecryptMessage = async (messageId: string, ciphertext: string, nonce: string, ephPub: string, fromWallet: string) => {
    if (decryptedMessages[messageId]) return;

    setDecrypting(prev => ({ ...prev, [messageId]: true }));
    try {
      const decrypted = decryptMessage(ciphertext, nonce, ephPub, fromWallet);
      if (decrypted) {
        setDecryptedMessages(prev => ({ ...prev, [messageId]: decrypted }));
      } else {
        setError('Failed to decrypt message');
      }
    } catch (error) {
      console.error('Error decrypting message:', error);
      setError('Failed to decrypt message');
    } finally {
      setDecrypting(prev => ({ ...prev, [messageId]: false }));
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm('Are you sure you want to delete this message? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/messages/${messageId}?wallet=${walletAddress}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete message');
      }

      // Remove message from local state
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
      
      // Remove from decrypted messages if it was decrypted
      setDecryptedMessages(prev => {
        const newDecrypted = { ...prev };
        delete newDecrypted[messageId];
        return newDecrypted;
      });

      // Notify parent component
      if (onMessageDeleted) {
        onMessageDeleted();
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete message');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return `${Math.floor(diffInHours * 60)}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const truncateMessage = (message: string, maxLength: number = 80) => {
    if (message.length <= maxLength) return message;
    return message.slice(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-cyan-400 rounded-xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <p className="text-gray-400">Loading messages...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={fetchMessages}
            className="bg-gradient-to-r from-purple-600 to-cyan-500 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-cyan-600 transition-all duration-300"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500/20 to-cyan-400/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No messages yet</h3>
          <p className="text-gray-400 mb-4">Your inbox is empty. Send a message to get started!</p>
          <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50">
            <p className="text-sm text-gray-300">
              Share your wallet address with friends to receive encrypted messages
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2 p-2 md:p-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className="group bg-gray-800/30 hover:bg-gray-800/50 rounded-xl p-3 md:p-4 transition-all duration-300 border border-gray-700/50 hover:border-purple-500/30 cursor-pointer"
        >
          <div className="flex items-start space-x-2 md:space-x-4">
            {/* Avatar */}
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-purple-500 to-cyan-400 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-xs md:text-sm">
                {message.fromWallet.slice(0, 2).toUpperCase()}
              </span>
            </div>

            {/* Message Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-white font-semibold text-sm">
                    {message.fromWallet === 'SolanaMail System' ? 'SolanaMail System' : truncateAddress(message.fromWallet)}
                  </span>
                  {message.fromWallet === 'SolanaMail System' && (
                    <span className="bg-gradient-to-r from-purple-600 to-cyan-500 text-xs text-white px-2 py-1 rounded-full">
                      System
                    </span>
                  )}
                </div>
                <span className="text-gray-400 text-xs">
                  {formatDate(message.createdAt)}
                </span>
              </div>

              {/* Message Preview */}
              <div className="mb-3">
                {decryptedMessages[message.id] ? (
                  <p className="text-gray-300 text-xs md:text-sm whitespace-pre-wrap break-words">
                    {decryptedMessages[message.id]}
                  </p>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <p className="text-gray-400 text-xs md:text-sm break-all">
                      {truncateMessage(message.ciphertext, 60)}
                    </p>
                    <button
                      onClick={() => handleDecryptMessage(message.id, message.ciphertext, message.nonce, message.ephPub, message.fromWallet)}
                      disabled={decrypting[message.id]}
                      className="bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-700 hover:to-cyan-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 whitespace-nowrap"
                    >
                      {decrypting[message.id] ? (
                        <div className="flex items-center space-x-1">
                          <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Decrypting...</span>
                        </div>
                      ) : (
                        'Decrypt'
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Message Actions */}
              <div className="flex items-center space-x-2 md:space-x-4 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
                {message.fromWallet !== 'SolanaMail System' && (
                  <button 
                    onClick={() => onReply && onReply(message.fromWallet)}
                    className="text-cyan-400 hover:text-cyan-300 text-xs font-medium"
                  >
                    Reply
                  </button>
                )}
                <button 
                  onClick={() => handleDeleteMessage(message.id)}
                  className="text-gray-400 hover:text-red-400 text-xs font-medium transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}