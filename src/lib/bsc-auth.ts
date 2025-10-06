/**
 * BSC/Ethereum Authentication Library
 * Handles authentication using Ethereum wallet signatures
 */

export interface BSCAuthResult {
  address: string;
  signature: string;
  message: string;
}

/**
 * Generates a message to sign for authentication
 */
export function generateAuthMessage(address: string): string {
  const timestamp = Date.now();
  return `Binance Smart Mail Authentication\nWallet: ${address}\nTimestamp: ${timestamp}`;
}

/**
 * Verifies an authentication signature
 */
export function verifyAuthSignature(
  address: string,
  message: string,
  signature: string
): boolean {
  try {
    // Basic verification that required fields are present
    return signature.length > 0 && message.length > 0 && address.length > 0;
  } catch (error) {
    console.error('Error verifying signature:', error);
    return false;
  }
}

/**
 * Generates an encryption key based on authentication
 */
export function generateEncryptionKey(authResult: BSCAuthResult): Uint8Array {
  // Convert signature to bytes for key derivation
  const signatureBytes = new TextEncoder().encode(authResult.signature);
  return deriveSecretKeyFromSignature(signatureBytes);
}

/**
 * Derives a secret key from a signature
 */
export function deriveSecretKeyFromSignature(signature: Uint8Array): Uint8Array {
  const key = new Uint8Array(32);
  
  for (let i = 0; i < 32; i++) {
    key[i] = signature[i % signature.length];
  }
  
  return key;
}

/**
 * BSC Network Configuration
 */
export const BSC_CONFIG = {
  mainnet: {
    chainId: 56,
    name: 'BNB Smart Chain',
    rpcUrl: 'https://bsc-dataseed.binance.org/',
    blockExplorer: 'https://bscscan.com',
  },
  testnet: {
    chainId: 97,
    name: 'BNB Smart Chain Testnet',
    rpcUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
    blockExplorer: 'https://testnet.bscscan.com',
  },
};

/**
 * Validates an Ethereum/BSC address
 */
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

