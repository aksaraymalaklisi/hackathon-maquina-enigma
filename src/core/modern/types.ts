export interface ModernEncryptedPayload {
  ciphertextBase64: string
  ivBase64: string
  mac: string // SHA-256 fingerprint do ciphertext
}

export interface DecryptResult {
  success: boolean
  plaintext?: string
  error?: string
  isTampered?: boolean
}

export interface CryptoComparisonMetrics {
  algorithm: string
  keyLengthBits: number
  keySpaceScientific: string
  bruteForceTimeText: string
  hasSelfEncryptionFlaw: boolean
  hasAuthenticationTag: boolean
  hasIntegrityProtection: boolean
}
