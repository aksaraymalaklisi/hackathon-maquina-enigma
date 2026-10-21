import type { EnigmaMachineConfig } from './types'

export interface KeySheetEntry {
  day: number
  machineId: string
  config: EnigmaMachineConfig
}

/**
 * Folha de Chaves oficial simulada (Kenngruppen / Tagesschlüssel)
 * Compartilhada entre as máquinas virtuais da rede (Máquinas 01 a 04).
 */
export const SHARED_KEY_SHEET: Record<string, EnigmaMachineConfig> = {
  MACHINE_01: {
    reflector: 'B',
    rotors: [
      { id: 'I', ringSetting: 1, position: 'A' },
      { id: 'II', ringSetting: 5, position: 'B' },
      { id: 'III', ringSetting: 12, position: 'C' },
    ],
    plugboard: ['AV', 'BS', 'CG', 'DL', 'FU', 'HZ', 'IN', 'KM', 'OW', 'RX'],
  },
  MACHINE_02: {
    reflector: 'B',
    rotors: [
      { id: 'I', ringSetting: 1, position: 'A' },
      { id: 'II', ringSetting: 5, position: 'B' },
      { id: 'III', ringSetting: 12, position: 'C' },
    ],
    plugboard: ['AV', 'BS', 'CG', 'DL', 'FU', 'HZ', 'IN', 'KM', 'OW', 'RX'],
  },
  MACHINE_03: {
    reflector: 'C',
    rotors: [
      { id: 'II', ringSetting: 3, position: 'M' },
      { id: 'IV', ringSetting: 8, position: 'N' },
      { id: 'V', ringSetting: 22, position: 'O' },
    ],
    plugboard: ['AT', 'BL', 'DF', 'GJ', 'HM', 'NW', 'OP', 'QY', 'RZ', 'VX'],
  },
  MACHINE_04: {
    reflector: 'C',
    rotors: [
      { id: 'II', ringSetting: 3, position: 'M' },
      { id: 'IV', ringSetting: 8, position: 'N' },
      { id: 'V', ringSetting: 22, position: 'O' },
    ],
    plugboard: ['AT', 'BL', 'DF', 'GJ', 'HM', 'NW', 'OP', 'QY', 'RZ', 'VX'],
  },
}
