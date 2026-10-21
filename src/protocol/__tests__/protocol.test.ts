import { describe, expect, it } from 'vitest'
import { calculateSha256 } from '../../core/modern/aes'
import { chunkPacket, deserializePayload, reassembleChunks, serializePayload } from '../serializer'
import { validatePacket } from '../validator'
import type { EnigmaNetPacket } from '../types'

describe('QR Code Protocol (ENIGMA-NET-v1)', () => {
  const samplePayload = 'KMFNWDPQMBLA'

  async function createValidPacket(): Promise<EnigmaNetPacket> {
    const mac = await calculateSha256(samplePayload)
    return {
      protocol: 'ENIGMA-NET-v1',
      sender: 'MACHINE_01',
      recipient: 'MACHINE_02',
      keyIndicator: 'B-I-II-III:01-05-12:A-B-C',
      mode: 'ENIGMA',
      timestamp: Date.now(),
      payload: samplePayload,
      mac,
      part: 1,
      totalParts: 1,
    }
  }

  it('deve serializar e desserializar pacotes perfeitamente para QR Code', async () => {
    const packet = await createValidPacket()
    const serialized = serializePayload(packet)
    expect(typeof serialized).toBe('string')

    const deserialized = deserializePayload(serialized)
    expect(deserialized).toEqual(packet)
  })

  it('deve validar com sucesso um pacote em conformidade estrita', async () => {
    const packet = await createValidPacket()
    const result = await validatePacket(packet)

    expect(result.valid).toBe(true)
    expect(result.error).toBeUndefined()
    expect(result.packet).toEqual(packet)
  })

  it('deve rejeitar pacotes com protocolo divergente ou cabeçalho incompleto', async () => {
    const packet = await createValidPacket()

    const badProtocol = { ...packet, protocol: 'INVALID-NET' }
    const res1 = await validatePacket(badProtocol)
    expect(res1.valid).toBe(false)
    expect(res1.error).toContain('Protocolo não suportado')

    const missingSender = { ...packet, sender: '' }
    const res2 = await validatePacket(missingSender)
    expect(res2.valid).toBe(false)
    expect(res2.error).toContain('Remetente')
  })

  it('deve detectar adulteração e rejeitar se o payload foi alterado sem atualizar o MAC', async () => {
    const packet = await createValidPacket()
    const tamperedPacket = {
      ...packet,
      payload: 'PAYLOAD_ADULTERADO_PELO_ATACANTE',
    }

    const result = await validatePacket(tamperedPacket)
    expect(result.valid).toBe(false)
    expect(result.error).toContain('Detecção de adulteração')
  })

  it('deve suportar fragmentação de mensagens longas em múltiplos QR Codes e posterior remontagem', () => {
    const longPayload = 'A'.repeat(250) // Mensagem com 250 caracteres
    const packet: Omit<EnigmaNetPacket, 'part' | 'totalParts'> = {
      protocol: 'ENIGMA-NET-v1',
      sender: 'MACHINE_01',
      recipient: 'MACHINE_02',
      keyIndicator: 'B-I-II-III:01-01-01:A-A-A',
      mode: 'ENIGMA',
      timestamp: Date.now(),
      payload: longPayload,
      mac: 'dummy-mac',
    }

    // Fragmenta em pedaços de no máximo 100 caracteres
    const chunks = chunkPacket(packet, 100)
    expect(chunks.length).toBe(3)
    expect(chunks[0].part).toBe(1)
    expect(chunks[0].totalParts).toBe(3)
    expect(chunks[1].part).toBe(2)
    expect(chunks[2].part).toBe(3)

    // Remonta
    const reassembled = reassembleChunks(chunks)
    expect(reassembled.payload).toBe(longPayload)
  })
})
