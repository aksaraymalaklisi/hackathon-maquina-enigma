export type RotorId = 'I' | 'II' | 'III' | 'IV' | 'V'
export type ReflectorId = 'B' | 'C'

export interface RotorConfig {
  id: RotorId
  /**
   * Ringstellung (1 a 26 ou letra A-Z). Offset da fiação interna em relação ao anel externo.
   */
  ringSetting: number
  /**
   * Grundstellung (posição inicial visível na janela: 'A'-'Z').
   */
  position: string
}

export interface EnigmaMachineConfig {
  reflector: ReflectorId
  /**
   * Rotores na ordem: [Esquerdo (Lento), Meio, Direito (Rápido)]
   */
  rotors: [RotorConfig, RotorConfig, RotorConfig]
  /**
   * Lista de pares do Plugboard (ex: ["AB", "CD", "EF"])
   */
  plugboard: string[]
}

export interface SignalPathStep {
  component: string
  inputChar: string
  outputChar: string
}

export interface EncryptResult {
  char: string
  rotorPositions: [string, string, string]
  signalPath: SignalPathStep[]
}
