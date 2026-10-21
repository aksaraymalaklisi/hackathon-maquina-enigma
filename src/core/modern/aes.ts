import type { DecryptResult, ModernEncryptedPayload } from './types'

// Helpers de conversão seguros para navegador e Node
function bufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

function base64ToBuffer(base64: string): Uint8Array {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * Calcula o Hash SHA-256 de uma string ou buffer usando Web Crypto API
 */
export async function calculateSha256(data: string | Uint8Array): Promise<string> {
  const encoder = new TextEncoder()
  const bytes = typeof data === 'string' ? encoder.encode(data) : data
  const hashBuffer = await crypto.subtle.digest('SHA-256', bytes)
  return bufferToHex(hashBuffer)
}

/**
 * Deriva uma chave AES-GCM de 256 bits a partir de uma senha arbitrária
 */
async function deriveAesKey(passphrase: string): Promise<CryptoKey> {
  const encoder = new TextEncoder()
  const keyMaterial = await crypto.subtle.digest('SHA-256', encoder.encode(passphrase))
  return crypto.subtle.importKey(
    'raw',
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  )
}

/**
 * Criptografa texto usando AES-GCM autenticado com IV aleatório de 12 bytes
 */
export async function encryptModern(
  plaintext: string,
  passphrase: string,
): Promise<ModernEncryptedPayload> {
  const key = await deriveAesKey(passphrase)
  const iv = crypto.getRandomValues(new Uint8Array(12)) // IV único de 12 bytes exigido pelo edital
  const encoder = new TextEncoder()
  const encodedPlaintext = encoder.encode(plaintext)

  const encryptedBuffer = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv,
      tagLength: 128, // 16 bytes de tag de autenticação
    },
    key,
    encodedPlaintext,
  )

  const ciphertextBase64 = bufferToBase64(encryptedBuffer)
  const ivBase64 = bufferToBase64(iv)
  const mac = await calculateSha256(ciphertextBase64)

  return {
    ciphertextBase64,
    ivBase64,
    mac,
  }
}

/**
 * Decifra o payload AES-GCM verificando a autenticação e integridade do payload
 */
export async function decryptModern(
  payload: ModernEncryptedPayload,
  passphrase: string,
): Promise<DecryptResult> {
  try {
    // 1. Validação preliminar do Hash SHA-256 (MAC)
    const currentMac = await calculateSha256(payload.ciphertextBase64)
    if (currentMac !== payload.mac) {
      return {
        success: false,
        error: 'MAC/Hash SHA-256 inválido! O texto cifrado foi adulterado antes do tráfego.',
        isTampered: true,
      }
    }

    // 2. Descriptografia e validação da Tag de Autenticação GCM
    const key = await deriveAesKey(passphrase)
    const iv = base64ToBuffer(payload.ivBase64)
    const ciphertext = base64ToBuffer(payload.ciphertextBase64)

    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv,
        tagLength: 128,
      },
      key,
      ciphertext,
    )

    const decoder = new TextDecoder()
    const plaintext = decoder.decode(decryptedBuffer)

    return {
      success: true,
      plaintext,
    }
  } catch {
    // AES-GCM rejeita automaticamente se a tag de autenticação falhar ou a chave for incorreta
    return {
      success: false,
      error: 'Falha na autenticação AES-GCM: Chave incorreta ou dados adulterados (Tag inválida).',
      isTampered: true,
    }
  }
}

/**
 * Utilitário para demonstração ao vivo: corrompe 1 bit ou byte do payload
 * para provar a rejeição de adulteração perante a banca avaliadora.
 */
export function tamperPayload(payload: ModernEncryptedPayload): ModernEncryptedPayload {
  const bytes = base64ToBuffer(payload.ciphertextBase64)
  if (bytes.length > 0) {
    // Inverte 1 bit no primeiro byte
    bytes[0] ^= 0x01
  }
  return {
    ...payload,
    ciphertextBase64: bufferToBase64(bytes),
  }
}
