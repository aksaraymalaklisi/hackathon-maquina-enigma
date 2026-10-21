import { REFLECTOR_DEFINITIONS } from './constants'
import type { ReflectorId } from './types'

export class Reflector {
  readonly id: ReflectorId
  readonly wiring: string

  constructor(id: ReflectorId = 'B') {
    const wiring = REFLECTOR_DEFINITIONS[id]
    if (!wiring) {
      throw new Error(`Refletor inválido: ${id}`)
    }
    this.id = id
    this.wiring = wiring
  }

  reflect(inputIndex: number): number {
    const reflectedChar = this.wiring[inputIndex]
    return reflectedChar.charCodeAt(0) - 65
  }
}
