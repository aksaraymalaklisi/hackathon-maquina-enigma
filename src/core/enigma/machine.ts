import { ALPHABET } from './constants'
import { Plugboard } from './plugboard'
import { Reflector } from './reflector'
import { Rotor } from './rotor'
import type { EnigmaMachineConfig, EncryptResult, ReflectorId, RotorId, SignalPathStep } from './types'

export class EnigmaMachine {
  readonly reflector: Reflector
  /**
   * [0] = Esquerdo (Lento), [1] = Meio, [2] = Direito (Rápido)
   */
  readonly rotors: [Rotor, Rotor, Rotor]
  readonly plugboard: Plugboard

  constructor(config: EnigmaMachineConfig) {
    this.reflector = new Reflector(config.reflector)
    this.rotors = [
      new Rotor(config.rotors[0]),
      new Rotor(config.rotors[1]),
      new Rotor(config.rotors[2]),
    ]
    this.plugboard = new Plugboard(config.plugboard)
  }

  /**
   * Executa o avanço mecânico dos rotores respeitando o engate dos entalhes
   * e a anomalia histórica de double-stepping do rotor intermediário.
   */
  step(): void {
    const left = this.rotors[0]
    const middle = this.rotors[1]
    const right = this.rotors[2]

    const middleAtNotch = middle.isAtNotch()
    const rightAtNotch = right.isAtNotch()

    if (middleAtNotch) {
      middle.step()
      left.step()
    } else if (rightAtNotch) {
      middle.step()
    }

    right.step()
  }

  /**
   * Cifra um único caractere com avanço dos rotores e rastreamento completo
   * do caminho elétrico (necessário para a animação pedagógica do edital).
   */
  processChar(input: string): EncryptResult {
    const upper = input.toUpperCase()
    if (!ALPHABET.includes(upper)) {
      return {
        char: upper,
        rotorPositions: this.getRotorPositions(),
        signalPath: [],
      }
    }

    // 1. Passo mecânico ocorre ANTES do contato elétrico fechar
    this.step()

    const signalPath: SignalPathStep[] = []
    let currentIdx = upper.charCodeAt(0) - 65

    // 2. Plugboard (entrada)
    const plugInChar = this.plugboard.swap(upper)
    signalPath.push({ component: 'Plugboard (Entrada)', inputChar: upper, outputChar: plugInChar })
    currentIdx = plugInChar.charCodeAt(0) - 65

    // 3. Rotores em direção ao refletor (Direito -> Meio -> Esquerdo)
    // Rotor Direito (Rápido)
    const rInChar = ALPHABET[currentIdx]
    currentIdx = this.rotors[2].forward(currentIdx)
    const rOutChar = ALPHABET[currentIdx]
    signalPath.push({ component: `Rotor Direito (${this.rotors[2].id})`, inputChar: rInChar, outputChar: rOutChar })

    // Rotor Meio
    const mInChar = ALPHABET[currentIdx]
    currentIdx = this.rotors[1].forward(currentIdx)
    const mOutChar = ALPHABET[currentIdx]
    signalPath.push({ component: `Rotor Meio (${this.rotors[1].id})`, inputChar: mInChar, outputChar: mOutChar })

    // Rotor Esquerdo (Lento)
    const lInChar = ALPHABET[currentIdx]
    currentIdx = this.rotors[0].forward(currentIdx)
    const lOutChar = ALPHABET[currentIdx]
    signalPath.push({ component: `Rotor Esquerdo (${this.rotors[0].id})`, inputChar: lInChar, outputChar: lOutChar })

    // 4. Refletor (Umkehrwalze)
    const refInChar = ALPHABET[currentIdx]
    currentIdx = this.reflector.reflect(currentIdx)
    const refOutChar = ALPHABET[currentIdx]
    signalPath.push({ component: `Refletor (${this.reflector.id})`, inputChar: refInChar, outputChar: refOutChar })

    // 5. Rotores no retorno (Esquerdo -> Meio -> Direito)
    // Rotor Esquerdo
    const lRetInChar = ALPHABET[currentIdx]
    currentIdx = this.rotors[0].backward(currentIdx)
    const lRetOutChar = ALPHABET[currentIdx]
    signalPath.push({ component: `Rotor Esquerdo (${this.rotors[0].id}) Retorno`, inputChar: lRetInChar, outputChar: lRetOutChar })

    // Rotor Meio
    const mRetInChar = ALPHABET[currentIdx]
    currentIdx = this.rotors[1].backward(currentIdx)
    const mRetOutChar = ALPHABET[currentIdx]
    signalPath.push({ component: `Rotor Meio (${this.rotors[1].id}) Retorno`, inputChar: mRetInChar, outputChar: mRetOutChar })

    // Rotor Direito
    const rRetInChar = ALPHABET[currentIdx]
    currentIdx = this.rotors[2].backward(currentIdx)
    const rRetOutChar = ALPHABET[currentIdx]
    signalPath.push({ component: `Rotor Direito (${this.rotors[2].id}) Retorno`, inputChar: rRetInChar, outputChar: rRetOutChar })

    // 6. Plugboard (saída)
    const preLampChar = ALPHABET[currentIdx]
    const finalChar = this.plugboard.swap(preLampChar)
    signalPath.push({ component: 'Plugboard (Saída)', inputChar: preLampChar, outputChar: finalChar })

    return {
      char: finalChar,
      rotorPositions: this.getRotorPositions(),
      signalPath,
    }
  }

  /**
   * Processa uma sequência de texto completa
   */
  processMessage(text: string): string {
    let result = ''
    for (const char of text.toUpperCase()) {
      if (ALPHABET.includes(char)) {
        result += this.processChar(char).char
      } else if (char === ' ') {
        result += ' '
      }
    }
    return result
  }

  /**
   * Retorna as posições visíveis atuais dos rotores ['L', 'M', 'R']
   */
  getRotorPositions(): [string, string, string] {
    return [
      this.rotors[0].getPositionLetter(),
      this.rotors[1].getPositionLetter(),
      this.rotors[2].getPositionLetter(),
    ]
  }

  /**
   * Define as posições visíveis dos rotores
   */
  setRotorPositions(positions: [string, string, string]): void {
    this.rotors[0].setPositionLetter(positions[0])
    this.rotors[1].setPositionLetter(positions[1])
    this.rotors[2].setPositionLetter(positions[2])
  }

  /**
   * Serializa a configuração da máquina para a folha de chaves / indicador do protocolo
   * Formato: [Refletor]-[Rotores]:[Ringstellung]:[Grundstellung]
   * Exemplo: "B-I-IV-V:01-12-24:A-B-C"
   */
  toKeyIndicator(): string {
    const ref = this.reflector.id
    const rotors = `${this.rotors[0].id}-${this.rotors[1].id}-${this.rotors[2].id}`
    const rings = this.rotors
      .map((r) => String(r.ringSetting + 1).padStart(2, '0'))
      .join('-')
    const pos = this.getRotorPositions().join('-')
    return `${ref}-${rotors}:${rings}:${pos}`
  }

  /**
   * Cria uma nova instância a partir de uma string de chave do protocolo
   */
  static fromKeyIndicator(indicator: string, plugboard: string[] = []): EnigmaMachine {
    // Exemplo: B-I-IV-V:01-12-24:A-B-C
    const [part1, part2, part3] = indicator.split(':')
    const [refId, r1, r2, r3] = part1.split('-') as [ReflectorId, RotorId, RotorId, RotorId]
    const rings = part2.split('-').map(Number)
    const positions = part3.split('-')

    return new EnigmaMachine({
      reflector: refId,
      rotors: [
        { id: r1, ringSetting: rings[0], position: positions[0] },
        { id: r2, ringSetting: rings[1], position: positions[1] },
        { id: r3, ringSetting: rings[2], position: positions[2] },
      ],
      plugboard,
    })
  }

  /**
   * Cria uma cópia profunda da máquina no estado atual
   */
  clone(): EnigmaMachine {
    return new EnigmaMachine({
      reflector: this.reflector.id,
      rotors: [
        { id: this.rotors[0].id, ringSetting: this.rotors[0].ringSetting + 1, position: this.rotors[0].getPositionLetter() },
        { id: this.rotors[1].id, ringSetting: this.rotors[1].ringSetting + 1, position: this.rotors[1].getPositionLetter() },
        { id: this.rotors[2].id, ringSetting: this.rotors[2].ringSetting + 1, position: this.rotors[2].getPositionLetter() },
      ],
      plugboard: this.plugboard.getPairs(),
    })
  }
}
