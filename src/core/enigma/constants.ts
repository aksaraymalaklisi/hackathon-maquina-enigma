import type { ReflectorId, RotorId } from './types'

export const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

export interface RotorDefinition {
  wiring: string
  notch: string // letra em que o engate (turnover) é disparado
}

/**
 * Fiações e entalhes históricos da Enigma I / M3 da Wehrmacht
 */
export const ROTOR_DEFINITIONS: Record<RotorId, RotorDefinition> = {
  I: {
    wiring: 'EKMFLGDQVZNTOWYHXUSPAIBRCJ',
    notch: 'Q', // Dispara avanço na transição Q -> R
  },
  II: {
    wiring: 'AJDKSIRUXBLHWTMCQGZNPYFVOE',
    notch: 'E', // Dispara avanço na transição E -> F
  },
  III: {
    wiring: 'BDFHJLCPRTXVZNYEIWGAKMUSQO',
    notch: 'V', // Dispara avanço na transição V -> W
  },
  IV: {
    wiring: 'ESOVPZJAYQUIRHXLNFTGKDCMWB',
    notch: 'J', // Dispara avanço na transição J -> K
  },
  V: {
    wiring: 'VZBRGITYUPSDNHLXAWMJQOFECK',
    notch: 'Z', // Dispara avanço na transição Z -> A
  },
}

/**
 * Refletores históricos (Umkehrwalze)
 */
export const REFLECTOR_DEFINITIONS: Record<ReflectorId, string> = {
  B: 'YRUHQSLDPXNGOKMIEBFZCWVJAT',
  C: 'FVPJIAOYEDRZXWGCTKUQSBNMHL',
}
