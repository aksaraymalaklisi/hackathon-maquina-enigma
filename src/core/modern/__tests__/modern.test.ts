import { describe, expect, it } from 'vitest'
import { calculateSha256, decryptModern, encryptModern, tamperPayload } from '../aes'
import { analyzeFrequency, verifyEnigmaFlaw } from '../comparison'

describe('Modern Cryptography Engine (AES-GCM & SHA-256)', () => {
  const password = 'SuperSecretHackathonKey2026!'
  const message = 'MENSAGEM CRIPTOGRAFADA ULTRA SECRETA'

  it('deve cifrar e decifrar com sucesso usando AES-GCM autenticado', async () => {
    const encrypted = await encryptModern(message, password)

    expect(encrypted.ciphertextBase64).toBeDefined()
    expect(encrypted.ivBase64).toBeDefined()
    expect(encrypted.mac).toBeDefined()

    const decrypted = await decryptModern(encrypted, password)
    expect(decrypted.success).toBe(true)
    expect(decrypted.plaintext).toBe(message)
    expect(decrypted.isTampered).toBeFalsy()
  })

  it('deve rejeitar e detectar IMEDIATAMENTE adulteração no payload (Integrity Check / MAC inválido)', async () => {
    const encrypted = await encryptModern(message, password)

    // Simula ataque Man-In-The-Middle alterando 1 bit do payload
    const tampered = tamperPayload(encrypted)

    const result = await decryptModern(tampered, password)
    expect(result.success).toBe(false)
    expect(result.isTampered).toBe(true)
    expect(result.plaintext).toBeUndefined()
  })

  it('deve falhar a decifragem ao fornecer senha/chave incorreta', async () => {
    const encrypted = await encryptModern(message, password)
    const result = await decryptModern(encrypted, 'SenhaCompletamenteIncorreta')

    expect(result.success).toBe(false)
    expect(result.plaintext).toBeUndefined()
  })

  it('deve gerar hashes SHA-256 determinísticos', async () => {
    const hash1 = await calculateSha256('ENIGMA-HACKATHON-2026')
    const hash2 = await calculateSha256('ENIGMA-HACKATHON-2026')
    const hashDiff = await calculateSha256('ENIGMA-HACKATHON-2027')

    expect(hash1).toBe(hash2)
    expect(hash1).not.toBe(hashDiff)
    expect(hash1.length).toBe(64) // 32 bytes em hex
  })

  it('deve verificar analiticamente a ausência da falha E(x)=x na análise de falhas', () => {
    const plain = 'ABCDE'
    const cipherEnigma = 'BCDEA' // Nenhuma letra igual
    const cipherFlawed = 'ABCDE' // Todas iguais

    expect(verifyEnigmaFlaw(plain, cipherEnigma).flawViolated).toBe(false)
    expect(verifyEnigmaFlaw(plain, cipherFlawed).flawViolated).toBe(true)
  })

  it('deve gerar distribuição de frequência correta para o comparativo visual', () => {
    const freq = analyzeFrequency('HELLO WORLD', 'KMFNW DPQMB')
    expect(freq.length).toBe(26)
    const lItem = freq.find((f) => f.letter === 'L')
    expect(lItem?.plainCount).toBe(3)
  })
})
