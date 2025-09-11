import nacl from 'tweetnacl';
import { PublicKey } from '@solana/web3.js';

/**
 * Génère une paire de clés éphémères pour le chiffrement
 */
export function generateEphemeralKeyPair() {
  return nacl.box.keyPair();
}

/**
 * Chiffre un message avec la clé publique du destinataire
 */
export function encryptMessage(
  message: string,
  recipientPublicKey: PublicKey,
  ephemeralKeyPair: nacl.BoxKeyPair
): {
  ciphertext: string;
  nonce: string;
  ephPub: string;
} {
  const messageBytes = new TextEncoder().encode(message);
  const nonce = nacl.randomBytes(24);
  
  // Convertir la clé publique Solana en format nacl
  const recipientBytes = recipientPublicKey.toBytes();
  
  // Chiffrer le message
  const ciphertext = nacl.box(
    messageBytes,
    nonce,
    recipientBytes,
    ephemeralKeyPair.secretKey
  );
  
  if (!ciphertext) {
    throw new Error('Échec du chiffrement du message');
  }
  
  return {
    ciphertext: Buffer.from(ciphertext).toString('base64'),
    nonce: Buffer.from(nonce).toString('base64'),
    ephPub: Buffer.from(ephemeralKeyPair.publicKey).toString('base64'),
  };
}

/**
 * Chiffre un message avec l'adresse du destinataire (méthode simplifiée)
 */
export function encryptMessageForWallet(
  message: string,
  recipientWalletAddress: string,
  senderWalletAddress: string
): {
  ciphertext: string;
  nonce: string;
  ephPub: string;
} {
  const messageBytes = new TextEncoder().encode(message);
  const nonce = nacl.randomBytes(24);
  
  // Créer une clé de chiffrement simple basée sur l'adresse du destinataire
  const recipientKey = derivePrivateKeyFromWallet(recipientWalletAddress);
  
  // Utiliser une clé éphémère simple
  const ephemeralKeyPair = generateEphemeralKeyPair();
  
  // Pour simplifier, utilisons un chiffrement symétrique avec la clé dérivée
  // et stockons la clé publique éphémère pour le déchiffrement
  const ciphertext = nacl.secretbox(messageBytes, nonce, recipientKey);
  
  if (!ciphertext) {
    throw new Error('Échec du chiffrement du message');
  }
  
  return {
    ciphertext: Buffer.from(ciphertext).toString('base64'),
    nonce: Buffer.from(nonce).toString('base64'),
    ephPub: Buffer.from(ephemeralKeyPair.publicKey).toString('base64'),
  };
}

/**
 * Génère une clé privée déterministe à partir d'une adresse de wallet
 */
export function derivePrivateKeyFromWallet(walletAddress: string): Uint8Array {
  // Créer une clé de 32 bytes à partir de l'adresse du wallet
  const key = new Uint8Array(32);
  const addressBytes = new TextEncoder().encode(walletAddress);
  
  // Utiliser l'adresse pour générer une clé déterministe
  for (let i = 0; i < 32; i++) {
    key[i] = addressBytes[i % addressBytes.length] ^ (i * 7);
  }
  
  return key;
}

/**
 * Génère une paire de clés déterministe à partir d'une adresse de wallet
 */
export function deriveKeyPairFromWallet(walletAddress: string): nacl.BoxKeyPair {
  const privateKey = derivePrivateKeyFromWallet(walletAddress);
  const keyPair = nacl.box.keyPair.fromSecretKey(privateKey);
  return keyPair;
}

/**
 * Déchiffre un message avec la clé privée du destinataire
 */
export function decryptMessage(
  ciphertext: string,
  nonce: string,
  ephPub: string,
  recipientSecretKey: Uint8Array
): string {
  try {
    const ciphertextBytes = new Uint8Array(Buffer.from(ciphertext, 'base64'));
    const nonceBytes = new Uint8Array(Buffer.from(nonce, 'base64'));
    const ephPubBytes = new Uint8Array(Buffer.from(ephPub, 'base64'));
    
    const decrypted = nacl.box.open(
      ciphertextBytes,
      nonceBytes,
      ephPubBytes,
      recipientSecretKey
    );
    
    if (!decrypted) {
      throw new Error('Échec du déchiffrement du message');
    }
    
    return new TextDecoder().decode(decrypted);
  } catch (error) {
    console.error('Erreur lors du déchiffrement:', error);
    throw new Error('Impossible de déchiffrer ce message');
  }
}

/**
 * Déchiffre un message avec l'adresse du wallet (méthode simplifiée)
 */
export function decryptMessageWithWallet(
  ciphertext: string,
  nonce: string,
  ephPub: string,
  walletAddress: string,
  fromWallet?: string
): string {
  try {
    // Si c'est un message système, décoder directement le base64
    if (fromWallet === 'SolanaMail System') {
      return Buffer.from(ciphertext, 'base64').toString('utf-8');
    }
    
    // Générer la clé privée à partir de l'adresse du wallet
    const privateKey = derivePrivateKeyFromWallet(walletAddress);
    
    const ciphertextBytes = new Uint8Array(Buffer.from(ciphertext, 'base64'));
    const nonceBytes = new Uint8Array(Buffer.from(nonce, 'base64'));
    
    // Utiliser secretbox.open pour déchiffrer avec la clé symétrique
    const decrypted = nacl.secretbox.open(ciphertextBytes, nonceBytes, privateKey);
    
    if (!decrypted) {
      throw new Error('Échec du déchiffrement du message');
    }
    
    return new TextDecoder().decode(decrypted);
  } catch (error) {
    console.error('Erreur lors du déchiffrement:', error);
    throw new Error('Impossible de déchiffrer ce message');
  }
}

/**
 * Génère une clé privée à partir d'une signature Solana
 */
export function deriveSecretKeyFromSignature(signature: Uint8Array): Uint8Array {
  // Utilise la signature pour générer une clé de 32 bytes
  // S'assurer que la signature est bien un Uint8Array
  const sigBytes = new Uint8Array(signature);
  
  // Créer une clé de 32 bytes à partir de la signature
  // Utiliser une méthode plus simple pour éviter les problèmes avec nacl.hash
  const key = new Uint8Array(32);
  
  // Prendre les premiers 32 bytes de la signature ou répéter si plus court
  for (let i = 0; i < 32; i++) {
    key[i] = sigBytes[i % sigBytes.length];
  }
  
  return key;
}
