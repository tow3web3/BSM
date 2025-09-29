'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@/contexts/WalletContext';

interface Contact {
  id: string;
  ownerWallet: string;
  address: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

interface ContactBookProps {
  onSelectContact?: (address: string) => void;
}

export default function ContactBook({ onSelectContact }: ContactBookProps) {
  const { publicKey } = useWallet();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [newContact, setNewContact] = useState({ name: '', address: '' });
  const [isClient, setIsClient] = useState(false);

  const fetchContacts = useCallback(async () => {
    if (!publicKey) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/contacts?wallet=${publicKey.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch contacts');
      }
      
      const data = await response.json();
      setContacts(data);
    } catch (err) {
      console.error('Error fetching contacts:', err);
      setError('Failed to load contacts');
    } finally {
      setLoading(false);
    }
  }, [publicKey]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && publicKey) {
      fetchContacts();
    }
  }, [isClient, publicKey, fetchContacts]);

  const validateWalletAddress = (address: string): boolean => {
    try {
      new (require('@solana/web3.js').PublicKey)(address);
      return true;
    } catch {
      return false;
    }
  };

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!publicKey) return;
    
    if (!newContact.name.trim() || !newContact.address.trim()) {
      setError('Name and address are required');
      return;
    }

    if (!validateWalletAddress(newContact.address)) {
      setError('Invalid Solana address');
      return;
    }

    try {
      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ownerWallet: publicKey.toString(),
          name: newContact.name.trim(),
          address: newContact.address.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add contact');
      }

      const contact = await response.json();
      setContacts([...contacts, contact]);
      setNewContact({ name: '', address: '' });
      setShowAddForm(false);
      setError(null);
    } catch (err) {
      console.error('Error adding contact:', err);
      setError(err instanceof Error ? err.message : 'Failed to add contact');
    }
  };

  const handleUpdateContact = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingContact) return;

    try {
      const response = await fetch(`/api/contacts/${editingContact.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editingContact.name,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update contact');
      }

      const updatedContact = await response.json();
      setContacts(contacts.map(c => c.id === updatedContact.id ? updatedContact : c));
      setEditingContact(null);
      setError(null);
    } catch (err) {
      console.error('Error updating contact:', err);
      setError('Failed to update contact');
    }
  };

  const handleDeleteContact = async (contactId: string) => {
    if (!confirm('Are you sure you want to delete this contact?')) return;

    try {
      const response = await fetch(`/api/contacts/${contactId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete contact');
      }

      setContacts(contacts.filter(c => c.id !== contactId));
      setError(null);
    } catch (err) {
      console.error('Error deleting contact:', err);
      setError('Failed to delete contact');
    }
  };

  const handleSelectContact = (address: string) => {
    if (onSelectContact) {
      onSelectContact(address);
    }
  };

  if (!isClient) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!publicKey) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-800 border border-gray-700 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-white mb-2">Connect Your Wallet</h3>
          <p className="text-gray-400">Please connect your wallet to manage contacts</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Add Contact Button */}
      <div className="p-6 border-b border-purple-500/20">
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="w-full bg-gray-800 border border-gray-700 text-white px-6 py-3 font-medium hover:bg-gray-700 transition-colors flex items-center justify-center"
        >
          <div className="flex items-center space-x-3">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>{showAddForm ? 'Cancel' : 'Add New Contact'}</span>
          </div>
        </button>
      </div>

      {/* Add Contact Form */}
      {showAddForm && (
        <div className="p-6 border-b border-purple-500/20 bg-black/5">
          <h3 className="text-lg font-medium text-white mb-4">Add New Contact</h3>
          <form onSubmit={handleAddContact} className="space-y-4">
            <div>
              <label className="block text-gray-300 mb-2 text-sm font-medium">Name</label>
              <input
                type="text"
                value={newContact.name}
                onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter contact name"
                required
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2 text-sm font-medium">Solana Address</label>
              <input
                type="text"
                value={newContact.address}
                onChange={(e) => setNewContact({ ...newContact, address: e.target.value })}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter Solana wallet address"
                required
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-gray-800 border border-gray-700 text-white px-6 py-3 font-medium hover:bg-gray-700 transition-colors"
              >
                Add Contact
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="bg-gray-700 border border-gray-600 text-white px-6 py-3 font-medium hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-500/20 border-b border-red-500/50">
          <div className="text-red-100 text-sm">{error}</div>
        </div>
      )}

      {/* Contacts List */}
      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-gray-400">Loading contacts...</p>
          </div>
        ) : contacts.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-800 border border-gray-700 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No Contacts Yet</h3>
            <p className="text-gray-400 mb-6">Add your first contact to get started!</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-gray-800 border border-gray-700 text-white px-6 py-3 font-medium hover:bg-gray-700 transition-colors"
            >
              Add Contact
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {contacts.map((contact) => (
              <div
                key={contact.id}
                className="bg-gray-800 border border-gray-700 p-4 hover:border-gray-600 transition-colors"
              >
                {editingContact?.id === contact.id ? (
                  <form onSubmit={handleUpdateContact} className="space-y-4">
                    <input
                      type="text"
                      value={editingContact.name}
                      onChange={(e) => setEditingContact({ ...editingContact, name: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                    <div className="text-xs text-gray-400 font-mono break-all">
                      {contact.address}
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="bg-gray-700 border border-gray-600 text-white px-3 py-1 text-sm font-medium hover:bg-gray-600 transition-colors"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingContact(null)}
                        className="bg-gray-600 border border-gray-500 text-white px-3 py-1 text-sm font-medium hover:bg-gray-500 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-white mb-1">{contact.name}</h3>
                        <div className="text-sm text-gray-400 font-mono break-all">
                          {contact.address}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Added {new Date(contact.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        {onSelectContact && (
                          <button
                            onClick={() => handleSelectContact(contact.address)}
                            className="text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors"
                            title="Select for messaging"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                          </button>
                        )}
                        <button
                          onClick={() => setEditingContact(contact)}
                          className="text-yellow-400 hover:text-yellow-300 text-sm font-medium transition-colors"
                          title="Edit contact"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteContact(contact.id)}
                          className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors"
                          title="Delete contact"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
