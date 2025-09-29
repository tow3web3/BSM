'use client';

import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && publicKey) {
      fetchContacts();
    }
  }, [isClient, publicKey]);

  const fetchContacts = async () => {
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
  };

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
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!publicKey) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📱</div>
          <h2 className="text-2xl font-bold text-white mb-2">Connect Your Wallet</h2>
          <p className="text-blue-200">Please connect your wallet to manage contacts</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 scroll-reveal">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            📇 Contact Book
          </h1>
          <p className="text-blue-200 text-lg">
            Manage your Solana contacts for easy messaging
          </p>
        </div>

        {/* Add Contact Button */}
        <div className="mb-6 scroll-reveal">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            {showAddForm ? 'Cancel' : '+ Add New Contact'}
          </button>
        </div>

        {/* Add Contact Form */}
        {showAddForm && (
          <div className="mb-8 scroll-reveal">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-4">Add New Contact</h3>
              <form onSubmit={handleAddContact} className="space-y-4">
                <div>
                  <label className="block text-white/90 mb-2 font-medium">Name</label>
                  <input
                    type="text"
                    value={newContact.name}
                    onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter contact name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white/90 mb-2 font-medium">Solana Address</label>
                  <input
                    type="text"
                    value={newContact.address}
                    onChange={(e) => setNewContact({ ...newContact, address: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter Solana wallet address"
                    required
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300"
                  >
                    Add Contact
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 scroll-reveal">
            <div className="bg-red-500/20 border border-red-500/50 text-red-100 px-4 py-3 rounded-xl">
              {error}
            </div>
          </div>
        )}

        {/* Contacts List */}
        <div className="scroll-reveal">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p className="text-white/70">Loading contacts...</p>
            </div>
          ) : contacts.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📇</div>
              <h3 className="text-2xl font-bold text-white mb-2">No Contacts Yet</h3>
              <p className="text-blue-200">Add your first contact to get started!</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {contacts.map((contact) => (
                <div
                  key={contact.id}
                  className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300"
                >
                  {editingContact?.id === contact.id ? (
                    <form onSubmit={handleUpdateContact} className="space-y-4">
                      <input
                        type="text"
                        value={editingContact.name}
                        onChange={(e) => setEditingContact({ ...editingContact, name: e.target.value })}
                        className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        required
                      />
                      <div className="text-xs text-white/60 font-mono break-all">
                        {contact.address}
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-sm transition-colors"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingContact(null)}
                          className="bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded-lg text-sm transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xl font-bold text-white">{contact.name}</h3>
                        <div className="flex gap-2">
                          {onSelectContact && (
                            <button
                              onClick={() => handleSelectContact(contact.address)}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-sm transition-colors"
                              title="Select for messaging"
                            >
                              📤
                            </button>
                          )}
                          <button
                            onClick={() => setEditingContact(contact)}
                            className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded-lg text-sm transition-colors"
                            title="Edit contact"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDeleteContact(contact.id)}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg text-sm transition-colors"
                            title="Delete contact"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                      <div className="text-sm text-white/80 font-mono break-all">
                        {contact.address}
                      </div>
                      <div className="text-xs text-white/50 mt-2">
                        Added {new Date(contact.createdAt).toLocaleDateString()}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
