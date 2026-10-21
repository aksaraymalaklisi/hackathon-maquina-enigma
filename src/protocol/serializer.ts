import type { EnigmaNetPacket } from './types'

/**
 * Serializa o pacote para string JSON pronta para geração de QR Code
 */
export function serializePayload(packet: EnigmaNetPacket): string {
  return JSON.stringify(packet)
}

/**
 * Desserializa uma string lida via QR Code (câmera) em um objeto EnigmaNetPacket
 */
export function deserializePayload(raw: string): EnigmaNetPacket {
  try {
    const parsed = JSON.parse(raw.trim())
    return parsed as EnigmaNetPacket
  } catch {
    throw new Error('Conteúdo lido pelo QR Code não é um JSON válido.')
  }
}

/**
 * Diferencial de Inovação: Fragmenta mensagens longas em múltiplos QR Codes numerados
 */
export function chunkPacket(
  packet: Omit<EnigmaNetPacket, 'part' | 'totalParts'>,
  chunkSize: number = 80,
): EnigmaNetPacket[] {
  const payload = packet.payload
  if (payload.length <= chunkSize) {
    return [
      {
        ...packet,
        part: 1,
        totalParts: 1,
      },
    ]
  }

  const chunks: string[] = []
  for (let i = 0; i < payload.length; i += chunkSize) {
    chunks.push(payload.slice(i, i + chunkSize))
  }

  const totalParts = chunks.length
  return chunks.map((chunkPayload, idx) => ({
    ...packet,
    payload: chunkPayload,
    part: idx + 1,
    totalParts,
  }))
}

/**
 * Remonta partes fragmentadas de múltiplos QR Codes lidos
 */
export function reassembleChunks(packets: EnigmaNetPacket[]): EnigmaNetPacket {
  if (packets.length === 0) {
    throw new Error('Nenhum pacote fornecido para remontagem.')
  }

  const base = packets[0]
  const total = base.totalParts ?? 1
  if (packets.length !== total) {
    throw new Error(`Pacotes incompletos: recebidos ${packets.length} de ${total} partes.`)
  }

  // Ordena por número de parte
  const sorted = [...packets].sort((a, b) => (a.part ?? 1) - (b.part ?? 1))
  const combinedPayload = sorted.map((p) => p.payload).join('')

  return {
    ...base,
    payload: combinedPayload,
    part: 1,
    totalParts: 1,
  }
}
