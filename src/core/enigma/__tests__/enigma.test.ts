import { describe, expect, it } from 'vitest'
import { EnigmaMachine } from '../machine'
import { SHARED_KEY_SHEET } from '../keySheet'
import type { EnigmaMachineConfig } from '../types'

describe('Enigma Machine Core Engine', () => {
  const baseConfig: EnigmaMachineConfig = {
    reflector: 'B',
    rotors: [
      { id: 'I', ringSetting: 1, position: 'A' },
      { id: 'II', ringSetting: 1, position: 'A' },
      { id: 'III', ringSetting: 1, position: 'A' },
    ],
    plugboard: ['AB', 'CD', 'EF'],
  }

  it('deve garantir a simetria recíproca mandatória: D(E(m)) === m', () => {
    const machineA = new EnigmaMachine(baseConfig)
    const machineB = new EnigmaMachine(baseConfig)

    const plaintext = 'ATTACKATDAWN'
    const ciphertext = machineA.processMessage(plaintext)

    expect(ciphertext).not.toBe(plaintext)
    expect(ciphertext.length).toBe(plaintext.length)

    const decrypted = machineB.processMessage(ciphertext)
    expect(decrypted).toBe(plaintext)
  })

  it('deve respeitar a propriedade fundamental da Enigma: uma letra NUNCA é cifrada como ela mesma (E(x) != x)', () => {
    const machine = new EnigmaMachine(baseConfig)
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

    for (let i = 0; i < alphabet.length; i++) {
      const char = alphabet[i]
      const result = machine.processChar(char)
      expect(result.char).not.toBe(char)
    }
  })

  it('deve provar que tentar decifrar com a chave errada gera texto completamente ilegível', () => {
    const sender = new EnigmaMachine(baseConfig)
    // Chave errada: posições iniciais divergentes
    const wrongReceiver = new EnigmaMachine({
      ...baseConfig,
      rotors: [
        { id: 'I', ringSetting: 1, position: 'X' },
        { id: 'II', ringSetting: 1, position: 'Y' },
        { id: 'III', ringSetting: 1, position: 'Z' },
      ],
    })

    const message = 'SECRETMESSAGEFORTESTINGENIGMACIPHER'
    const cipher = sender.processMessage(message)
    const wrongDecryption = wrongReceiver.processMessage(cipher)

    expect(wrongDecryption).not.toBe(message)
    // Verifica taxa de similaridade muito baixa (garantindo ilegibilidade)
    let matchCount = 0
    for (let i = 0; i < message.length; i++) {
      if (message[i] === wrongDecryption[i]) matchCount++
    }
    expect(matchCount / message.length).toBeLessThan(0.2)
  })

  it('deve executar o mecanismo mecânico de double-stepping do rotor do meio com precisão histórica', () => {
    // Rotor III (rápido, notch em V)
    // Rotor II (meio, notch em E)
    // Rotor I (lento, notch em Q)
    const machine = new EnigmaMachine({
      reflector: 'B',
      rotors: [
        { id: 'I', ringSetting: 1, position: 'A' },
        { id: 'II', ringSetting: 1, position: 'D' }, // Próximo ao notch 'E'
        { id: 'III', ringSetting: 1, position: 'U' }, // Próximo ao notch 'V'
      ],
      plugboard: [],
    })

    // Passo 1: U -> V (Rotor direito atinge notch V)
    machine.step()
    expect(machine.getRotorPositions()).toEqual(['A', 'D', 'V'])

    // Passo 2: V -> W faz o rotor do meio avançar de D -> E (posição do seu próprio notch!)
    machine.step()
    expect(machine.getRotorPositions()).toEqual(['A', 'E', 'W'])

    // Passo 3: O rotor do meio está no seu notch 'E', então no próximo passo ocorre o double-stepping!
    // Tanto o rotor da esquerda avança (A -> B), quanto o do meio avança novamente (E -> F)!
    machine.step()
    expect(machine.getRotorPositions()).toEqual(['B', 'F', 'X'])
  })

  it('deve aplicar corretamente o Ringstellung (offset de anel)', () => {
    const configRing1: EnigmaMachineConfig = {
      reflector: 'B',
      rotors: [
        { id: 'I', ringSetting: 1, position: 'A' },
        { id: 'II', ringSetting: 1, position: 'A' },
        { id: 'III', ringSetting: 1, position: 'A' },
      ],
      plugboard: [],
    }

    const configRing2: EnigmaMachineConfig = {
      reflector: 'B',
      rotors: [
        { id: 'I', ringSetting: 2, position: 'A' },
        { id: 'II', ringSetting: 2, position: 'A' },
        { id: 'III', ringSetting: 2, position: 'A' },
      ],
      plugboard: [],
    }

    const machine1 = new EnigmaMachine(configRing1)
    const machine2 = new EnigmaMachine(configRing2)

    const text = 'HELLO'
    const cipher1 = machine1.processMessage(text)
    const cipher2 = machine2.processMessage(text)

    expect(cipher1).not.toBe(cipher2)
  })

  it('deve serializar e restaurar estado via keyIndicator compatível com o protocolo', () => {
    const machine = new EnigmaMachine({
      reflector: 'B',
      rotors: [
        { id: 'I', ringSetting: 1, position: 'A' },
        { id: 'IV', ringSetting: 12, position: 'B' },
        { id: 'V', ringSetting: 24, position: 'C' },
      ],
      plugboard: ['XF', 'YZ'],
    })

    const indicator = machine.toKeyIndicator()
    expect(indicator).toBe('B-I-IV-V:01-12-24:A-B-C')

    const restored = EnigmaMachine.fromKeyIndicator(indicator, ['XF', 'YZ'])
    expect(restored.toKeyIndicator()).toBe(indicator)

    const testMsg = 'PROJETOHACKATHON'
    expect(machine.processMessage(testMsg)).toBe(restored.processMessage(testMsg))
  })

  it('deve funcionar perfeitamente com a folha de chaves compartilhada entre as máquinas da rede', () => {
    const m1 = new EnigmaMachine(SHARED_KEY_SHEET.MACHINE_01)
    const m2 = new EnigmaMachine(SHARED_KEY_SHEET.MACHINE_02)

    const secret = 'COMUNICACAOSEGURAENIGMA'
    const encrypted = m1.processMessage(secret)
    const decrypted = m2.processMessage(encrypted)

    expect(decrypted).toBe(secret)
  })
})
