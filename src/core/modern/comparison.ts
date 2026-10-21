import type { CryptoComparisonMetrics } from './types'

export const ENIGMA_METRICS: CryptoComparisonMetrics = {
  algorithm: 'Enigma M3 (Wehrmacht, 1940)',
  keyLengthBits: 67, // ~1.58 x 10^20 estados possíveis
  keySpaceScientific: '1.58 × 10²⁰ estados',
  bruteForceTimeText: 'Minutos a horas (com Bombe polonesa/britânica explorando cribs e falha E(x)≠x)',
  hasSelfEncryptionFlaw: true, // E(x) != x sempre
  hasAuthenticationTag: false, // Sem integridade
  hasIntegrityProtection: false,
}

export const AES_256_METRICS: CryptoComparisonMetrics = {
  algorithm: 'AES-256-GCM (Padrão Moderno, NIST)',
  keyLengthBits: 256,
  keySpaceScientific: '1.15 × 10⁷⁷ combinações (2²⁵⁶)',
  bruteForceTimeText: '3.6 × 10⁵¹ anos (inviável mesmo com todos os supercomputadores da Terra)',
  hasSelfEncryptionFlaw: false, // Pode mapear byte para o mesmo byte
  hasAuthenticationTag: true, // 128-bit Poly1305 / GHASH
  hasIntegrityProtection: true, // Rejeita qualquer alteração de 1 bit
}

export interface FrequencyAnalysisItem {
  letter: string
  plainCount: number
  enigmaCount: number
}

/**
 * Realiza análise de frequência comparativa entre texto original e cifrado Enigma
 */
export function analyzeFrequency(plaintext: string, enigmaCiphertext: string): FrequencyAnalysisItem[] {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const plainMap: Record<string, number> = {}
  const enigmaMap: Record<string, number> = {}

  for (const char of alphabet) {
    plainMap[char] = 0
    enigmaMap[char] = 0
  }

  for (const c of plaintext.toUpperCase()) {
    if (plainMap[c] !== undefined) plainMap[c]++
  }

  for (const c of enigmaCiphertext.toUpperCase()) {
    if (enigmaMap[c] !== undefined) enigmaMap[c]++
  }

  return alphabet.split('').map((letter) => ({
    letter,
    plainCount: plainMap[letter],
    enigmaCount: enigmaMap[letter],
  }))
}

/**
 * Valida a falha clássica: verifica se em alguma posição E(x) == x
 */
export function verifyEnigmaFlaw(plaintext: string, ciphertext: string): {
  flawViolated: boolean
  totalChecks: number
  selfEncryptedCount: number
} {
  let selfEncryptedCount = 0
  const cleanPlain = plaintext.toUpperCase().replace(/[^A-Z]/g, '')
  const cleanCipher = ciphertext.toUpperCase().replace(/[^A-Z]/g, '')
  const len = Math.min(cleanPlain.length, cleanCipher.length)

  for (let i = 0; i < len; i++) {
    if (cleanPlain[i] === cleanCipher[i]) {
      selfEncryptedCount++
    }
  }

  return {
    flawViolated: selfEncryptedCount > 0,
    totalChecks: len,
    selfEncryptedCount,
  }
}
