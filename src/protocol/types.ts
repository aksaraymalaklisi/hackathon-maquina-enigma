export type NetworkMode = 'ENIGMA' | 'AES'

export interface EnigmaNetPacket {
  protocol: 'ENIGMA-NET-v1'
  sender: string // ex: "MACHINE_01"
  recipient: string // ex: "MACHINE_02"
  keyIndicator: string // ex: "B-I-IV-V:01-12-24:A-B-C"
  mode: NetworkMode
  timestamp: number
  payload: string // Texto cifrado Enigma ou Base64 AES
  mac: string // Hash SHA-256 para integridade
  part?: number // 1..totalParts (suporte a fragmentação de QR Code)
  totalParts?: number
}

export interface ValidationResult {
  valid: boolean
  error?: string
  packet?: EnigmaNetPacket
}
