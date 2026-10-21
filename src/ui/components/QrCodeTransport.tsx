import React, { useEffect, useRef, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Html5Qrcode } from 'html5-qrcode'
import { Camera, Copy, Check, QrCode, AlertTriangle } from 'lucide-react'
import type { EnigmaNetPacket } from '../../protocol/types'
import { deserializePayload, serializePayload } from '../../protocol/serializer'
import { validatePacket } from '../../protocol/validator'

interface QrCodeTransportProps {
  currentPacket: EnigmaNetPacket | null
  onPacketReceived: (packet: EnigmaNetPacket) => void
  activeMachineId: string
}

export const QrCodeTransport: React.FC<QrCodeTransportProps> = ({
  currentPacket,
  onPacketReceived,
  activeMachineId,
}) => {
  const [mode, setMode] = useState<'GENERATE' | 'SCAN'>('GENERATE')
  const [copied, setCopied] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [scanError, setScanError] = useState<string | null>(null)
  const [manualPayload, setManualPayload] = useState('')
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null)

  // Desliga o scanner ao desmontar ou trocar de aba
  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        html5QrCodeRef.current.stop().catch(() => {})
      }
    }
  }, [])

  const startScanner = async () => {
    setScanError(null)
    setIsScanning(true)

    try {
      const qrScanner = new Html5Qrcode('qr-reader')
      html5QrCodeRef.current = qrScanner

      await qrScanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        async (decodedText) => {
          try {
            const rawPacket = deserializePayload(decodedText)
            const validation = await validatePacket(rawPacket)

            if (!validation.valid || !validation.packet) {
              setScanError(validation.error ?? 'Pacote de QR Code corrompido.')
              return
            }

            // Sucesso!
            await qrScanner.stop()
            setIsScanning(false)
            onPacketReceived(validation.packet)
          } catch (err: unknown) {
            setScanError((err as Error).message ?? 'Falha ao processar QR Code.')
          }
        },
        () => {
          // Callback de frame vazio
        },
      )
    } catch (err) {
      setIsScanning(false)
      setScanError('Câmera indisponível ou permissão negada. Use a entrada manual abaixo.')
    }
  }

  const stopScanner = async () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      await html5QrCodeRef.current.stop().catch(() => {})
      setIsScanning(false)
    }
  }

  const handleManualImport = async () => {
    if (!manualPayload.trim()) return
    setScanError(null)

    try {
      const raw = deserializePayload(manualPayload)
      const res = await validatePacket(raw)
      if (!res.valid || !res.packet) {
        setScanError(res.error ?? 'Pacote inválido.')
        return
      }
      onPacketReceived(res.packet)
      setManualPayload('')
    } catch (err: unknown) {
      setScanError((err as Error).message ?? 'JSON inválido.')
    }
  }

  const serialized = currentPacket ? serializePayload(currentPacket) : ''

  const handleCopy = () => {
    if (serialized) {
      navigator.clipboard.writeText(serialized)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="bg-zinc-900/95 border border-zinc-800 rounded-xl p-4 sm:p-5 shadow-2xl backdrop-blur-md">
      {/* Abas: Gerar QR Code vs Ler Câmera */}
      <div className="flex border-b border-zinc-800 pb-3 mb-4 justify-between items-center">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              stopScanner()
              setMode('GENERATE')
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              mode === 'GENERATE'
                ? 'bg-amber-500 text-zinc-950 shadow'
                : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Emitir QR Code</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('SCAN')
              startScanner()
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              mode === 'SCAN'
                ? 'bg-amber-500 text-zinc-950 shadow'
                : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Ler pela Câmera</span>
          </button>
        </div>

        <span className="text-[11px] font-mono text-zinc-500">
          ID: {activeMachineId}
        </span>
      </div>

      {mode === 'GENERATE' && (
        <div className="flex flex-col items-center">
          {currentPacket && currentPacket.payload ? (
            <>
              {/* QR Code Canvas */}
              <div className="p-3 bg-white rounded-xl shadow-xl border-4 border-amber-500/50 my-2">
                <QRCodeSVG
                  value={serialized}
                  size={200}
                  level="M"
                  includeMargin={true}
                />
              </div>

              {/* Informações do cabeçalho do protocolo */}
              <div className="w-full mt-3 p-3 bg-zinc-950/70 border border-zinc-800 rounded-lg text-xs font-mono space-y-1">
                <div className="flex justify-between text-zinc-400">
                  <span>Protocolo:</span>
                  <span className="text-zinc-200">{currentPacket.protocol}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Remetente ➔ Destinatário:</span>
                  <span className="text-amber-400 font-bold">
                    {currentPacket.sender} ➔ {currentPacket.recipient}
                  </span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Indicador de Chave:</span>
                  <span className="text-zinc-200">{currentPacket.keyIndicator}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Modo:</span>
                  <span className="text-blue-400 font-bold">{currentPacket.mode}</span>
                </div>
                <div className="flex justify-between text-zinc-400 truncate">
                  <span>MAC SHA-256:</span>
                  <span className="text-zinc-400 text-[10px] truncate max-w-[160px]">
                    {currentPacket.mac}
                  </span>
                </div>
              </div>

              {/* Ação de Copiar Payload */}
              <button
                type="button"
                onClick={handleCopy}
                className="mt-3 flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-mono transition-colors border border-zinc-700"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-green-400" />
                    <span>Payload Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Copiar Payload JSON</span>
                  </>
                )}
              </button>
            </>
          ) : (
            <div className="py-8 text-center text-xs text-zinc-500 font-mono">
              Digite uma mensagem no teclado ou caixa de texto para gerar o QR Code de transporte.
            </div>
          )}
        </div>
      )}

      {mode === 'SCAN' && (
        <div className="flex flex-col items-center w-full">
          {/* Leitor de Câmera */}
          <div
            id="qr-reader"
            className="w-full max-w-[280px] min-h-[220px] rounded-lg overflow-hidden border border-zinc-700 bg-zinc-950 mb-3"
          />

          {isScanning && (
            <p className="text-xs text-amber-400 animate-pulse font-mono mb-2">
              Aponte a câmera para o QR Code gerado por outra máquina...
            </p>
          )}

          {scanError && (
            <div className="w-full p-2.5 bg-red-950/40 border border-red-800/60 rounded-lg text-red-300 text-xs flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{scanError}</span>
            </div>
          )}

          {/* Fallback de importação manual (essencial para testes em tela única ou sem webcam) */}
          <div className="w-full pt-3 border-t border-zinc-800 mt-2">
            <label className="text-[11px] font-mono text-zinc-400 block mb-1">
              Ou cole o JSON do QR Code diretamente:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder='{"protocol":"ENIGMA-NET-v1",...}'
                value={manualPayload}
                onChange={(e) => setManualPayload(e.target.value)}
                className="flex-1 bg-zinc-950 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 font-mono"
              />
              <button
                type="button"
                onClick={handleManualImport}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-lg text-xs transition-colors"
              >
                Decifrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
