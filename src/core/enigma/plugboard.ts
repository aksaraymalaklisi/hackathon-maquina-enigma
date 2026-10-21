export class Plugboard {
  private wiringMap: Map<string, string> = new Map()

  constructor(pairs: string[] = []) {
    this.setPairs(pairs)
  }

  /**
   * Configura os pares de conexões do plugboard.
   * Valida se não há letras repetidas ou pares inválidos.
   */
  setPairs(pairs: string[]): void {
    this.wiringMap.clear()
    const usedLetters = new Set<string>()

    for (const pair of pairs) {
      const cleanPair = pair.trim().toUpperCase().replace(/[^A-Z]/g, '')
      if (cleanPair.length !== 2) {
        continue
      }
      const [a, b] = [cleanPair[0], cleanPair[1]]
      if (a === b) {
        continue
      }
      if (usedLetters.has(a) || usedLetters.has(b)) {
        throw new Error(`Letra duplicada no Plugboard: ${a} ou ${b} já conectado.`)
      }

      usedLetters.add(a)
      usedLetters.add(b)
      this.wiringMap.set(a, b)
      this.wiringMap.set(b, a)
    }
  }

  /**
   * Retorna os pares ativos configurados (ex: ["AB", "CD"])
   */
  getPairs(): string[] {
    const pairs: string[] = []
    const visited = new Set<string>()

    for (const [a, b] of this.wiringMap.entries()) {
      if (!visited.has(a) && !visited.has(b)) {
        visited.add(a)
        visited.add(b)
        pairs.push(`${a}${b}`)
      }
    }
    return pairs
  }

  /**
   * Aplica a troca de letra pelo plugboard
   */
  swap(char: string): string {
    const upper = char.toUpperCase()
    return this.wiringMap.get(upper) ?? upper
  }

  /**
   * Aplica a troca por índice numérico (0=A..25=Z)
   */
  swapIndex(index: number): number {
    const char = String.fromCharCode(65 + index)
    const swapped = this.swap(char)
    return swapped.charCodeAt(0) - 65
  }
}
