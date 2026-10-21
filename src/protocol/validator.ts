import { calculateSha256 } from '../core/modern/aes'
import type { EnigmaNetPacket, ValidationResult } from './types'

/**
 * Valida a integridade, esquema e conformidade de um pacote recebido via QR Code
 */
export async function validatePacket(data: unknown): Promise<ValidationResult> {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Pacote inválido: esperado um objeto JSON.' }
  }

  const p = data as Record<string, unknown>

  if (p.protocol !== 'ENIGMA-NET-v1') {
    return { valid: false, error: `Protocolo não suportado: esperado 'ENIGMA-NET-v1', recebido '${p.protocol}'` }
  }

  if (typeof p.sender !== 'string' || !p.sender.trim()) {
    return { valid: false, error: 'Remetente (sender) ausente ou inválido.' }
  }

  if (typeof p.recipient !== 'string' || !p.recipient.trim()) {
    return { valid: false, error: 'Destinatário (recipient) ausente ou inválido.' }
  }

  if (p.mode !== 'ENIGMA' && p.mode !== 'AES') {
    return { valid: false, error: `Modo inválido: '${p.mode}'. Esperado 'ENIGMA' ou 'AES'.` }
  }

  if (typeof p.keyIndicator !== 'string' || !p.keyIndicator.includes(':')) {
    return { valid: false, error: 'Indicador de chave (keyIndicator) malformado.' }
  }

  if (typeof p.payload !== 'string') {
    return { valid: false, error: 'Carga útil (payload) ausente ou inválida.' }
  }

  if (typeof p.mac !== 'string' || !p.mac.trim()) {
    return { valid: false, error: 'Código de autenticação de mensagem (mac) ausente.' }
  }

  // Se for uma mensagem completa (não fragmentada em múltiplos QR codes), valida o MAC
  const isSinglePart = !p.totalParts || p.totalParts === 1
  if (isSinglePart) {
    const calculatedMac = await calculateSha256(p.payload)
    if (calculatedMac !== p.mac) {
      return {
        valid: false,
        error: 'Detecção de adulteração: Hash SHA-256 (MAC) divergente da carga recebida!',
        packet: p as unknown as EnigmaNetPacket,
      }
    }
  }

  return {
    valid: true,
    packet: p as unknown as EnigmaNetPacket,
  }
}
