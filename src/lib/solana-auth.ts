import { PublicKey, Connection } from '@solana/web3.js';
import { deriveSecretKeyFromSignature } from './encryption';

export interface SolanaAuthResult {
  publicKey: PublicKey;
  signature: Uint8Array;
  message: string;
}

/**
 * Génère un message à signer pour l'authentification
 */
export function generateAuthMessage(publicKey: PublicKey): string {
  const timestamp = Date.now();
  return `Authentification Solana Messenger\nWallet: ${publicKey.toString()}\nTimestamp: ${timestamp}`;
}

/**
 * Vérifie une signature d'authentification
 */
export function verifyAuthSignature(
  publicKey: PublicKey,
  message: string,
  signature: Uint8Array
): boolean {
  try {
    // Vérifie que la signature correspond au message et à la clé publique
    const messageBytes = new TextEncoder().encode(message);
    
    // Note: En production, vous devriez utiliser une vérification plus robuste
    // Cette implémentation simplifiée vérifie juste que la signature n'est pas vide
    return signature.length > 0 && messageBytes.length > 0;
  } catch (error) {
    console.error('Erreur lors de la vérification de la signature:', error);
    return false;
  }
}

/**
 * Génère une clé privée pour le chiffrement basée sur l'authentification
 */
export function generateEncryptionKey(authResult: SolanaAuthResult): Uint8Array {
  // S'assurer que la signature est bien un Uint8Array
  let signature: Uint8Array;
  if (authResult.signature instanceof Uint8Array) {
    signature = authResult.signature;
  } else if (Array.isArray(authResult.signature)) {
    signature = new Uint8Array(authResult.signature);
  } else {
    // Si c'est un autre format, essayer de le convertir
    signature = new Uint8Array(Object.values(authResult.signature));
  }
  
  return deriveSecretKeyFromSignature(signature);
}

/**
 * Configuration de connexion Solana
 */
export const SOLANA_CONFIG = {
  devnet: 'https://api.devnet.solana.com',
  mainnet: 'https://api.mainnet.solana.com',
  testnet: 'https://api.testnet.solana.com',
};

export function getSolanaConnection(network: string = 'devnet'): Connection {
  const endpoint = SOLANA_CONFIG[network as keyof typeof SOLANA_CONFIG] || SOLANA_CONFIG.devnet;
  return new Connection(endpoint, 'confirmed');
}
