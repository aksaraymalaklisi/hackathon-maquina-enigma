import { ALPHABET, ROTOR_DEFINITIONS, type RotorDefinition } from './constants'
import type { RotorConfig, RotorId } from './types'

export class Rotor {
  readonly id: RotorId
  readonly wiring: string
  readonly notch: string
  ringSetting: number // 0 a 25 (Ringstellung: 1=0, 26=25)
  position: number // 0 a 25 (Grundstellung: A=0, Z=25)

  constructor(config: RotorConfig) {
    const def: RotorDefinition = ROTOR_DEFINITIONS[config.id]
    if (!def) {
      throw new Error(`Rotor inválido: ${config.id}`)
    }
    this.id = config.id
    this.wiring = def.wiring
    this.notch = def.notch
    this.ringSetting = Math.max(0, (config.ringSetting - 1) % 26)
    this.position = (config.position.toUpperCase().charCodeAt(0) - 65 + 26) % 26
  }

  /**
   * Indica se o rotor está posicionado sobre seu entalhe mecânico (notch)
   */
  isAtNotch(): boolean {
    const notchIndex = this.notch.charCodeAt(0) - 65
    return this.position === notchIndex
  }

  /**
   * Avança uma posição (odômetro)
   */
  step(): void {
    this.position = (this.position + 1) % 26
  }

  /**
   * Retorna a letra visível atual no visor
   */
  getPositionLetter(): string {
    return ALPHABET[this.position]
  }

  /**
   * Define manualmente a letra visível no visor ('A'-'Z')
   */
  setPositionLetter(letter: string): void {
    const upper = letter.toUpperCase()
    if (upper >= 'A' && upper <= 'Z') {
      this.position = upper.charCodeAt(0) - 65
    }
  }

  /**
   * Passagem do sinal para frente (da direita para esquerda, em direção ao refletor)
   */
  forward(inputIndex: number): number {
    const offset = (this.position - this.ringSetting + 26) % 26
    const entryIndex = (inputIndex + offset) % 26
    const wiredChar = this.wiring[entryIndex]
    const exitIndex = wiredChar.charCodeAt(0) - 65
    return (exitIndex - offset + 26) % 26
  }

  /**
   * Passagem de retorno do sinal (da esquerda para direita, vindo do refletor)
   */
  backward(inputIndex: number): number {
    const offset = (this.position - this.ringSetting + 26) % 26
    const entryIndex = (inputIndex + offset) % 26
    const targetChar = ALPHABET[entryIndex]
    const wiredIndex = this.wiring.indexOf(targetChar)
    return (wiredIndex - offset + 26) % 26
  }
}
