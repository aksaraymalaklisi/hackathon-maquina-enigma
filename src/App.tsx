import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  BookOpen,
  Copy,
  KeyRound,
  Layers,
  QrCode,
  RotateCcw,
  Shield,
  Smartphone,
  Volume2,
  VolumeX,
} from 'lucide-react'
import { EnigmaMachine } from './core/enigma/machine'
import type {
  EnigmaMachineConfig,
  ReflectorId,
  RotorConfig,
  RotorId,
  SignalPathStep,
} from './core/enigma/types'
import { encryptModern, calculateSha256 } from './core/modern/aes'
import type { ModernEncryptedPayload } from './core/modern/types'
import type { EnigmaNetPacket } from './protocol/types'
import { Lampboard } from './ui/components/Lampboard'
import { Keyboard } from './ui/components/Keyboard'
import { RotorBay } from './ui/components/RotorBay'
import { PlugboardControl } from './ui/components/PlugboardControl'
import { SignalPathVisualizer } from './ui/components/SignalPathVisualizer'
import { QrCodeTransport } from './ui/components/QrCodeTransport'
import { ModernComparisonPanel } from './ui/components/ModernComparisonPanel'
import { KeySheetModal } from './ui/components/KeySheetModal'
import { Enigma3DScene } from './ui/scene/Enigma3DScene'
import { useEnigmaAudio } from './ui/hooks/useEnigmaAudio'

export default function App() {
  // Configuração da Máquina Enigma
  const [machineId, setMachineId] = useState<string>('MACHINE_01')
  const [reflector, setReflector] = useState<ReflectorId>('B')
  const [rotors, setRotors] = useState<[RotorConfig, RotorConfig, RotorConfig]>([
    { id: 'I', ringSetting: 1, position: 'A' },
    { id: 'II', ringSetting: 5, position: 'B' },
    { id: 'III', ringSetting: 12, position: 'C' },
  ])
  const [plugboardPairs, setPlugboardPairs] = useState<string[]>([
    'AV', 'BS', 'CG', 'DL', 'FU', 'HZ', 'IN', 'KM', 'OW', 'RX',
  ])

  // Estados de Interface e Cifragem
  const [isLidOpen, setIsLidOpen] = useState(false)
  const [is3DMode, setIs3DMode] = useState(false) // Padrão Modo Leve para performance máxima
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [activeLampChar, setActiveLampChar] = useState<string | null>(null)
  const [pressedKey, setPressedKey] = useState<string | null>(null)
  const [plaintext, setPlaintext] = useState<string>('')
  const [ciphertext, setCiphertext] = useState<string>('')
  const [signalSteps, setSignalSteps] = useState<SignalPathStep[]>([])
  const [lastInputChar, setLastInputChar] = useState<string | null>(null)

  // Criptografia Moderna
  const [modernPassphrase, setModernPassphrase] = useState<string>('ENIGMA_NET_AES_KEY_2026')
  const [modernPayload, setModernPayload] = useState<ModernEncryptedPayload | null>(null)

  // Pacote do Protocolo para QR Code
  const [currentPacket, setCurrentPacket] = useState<EnigmaNetPacket | null>(null)

  // Aba ativa: 'ENIGMA' | 'QR' | 'MODERN' | 'KEYS'
  const [activeTab, setActiveTab] = useState<'ENIGMA' | 'QR' | 'MODERN' | 'KEYS'>('ENIGMA')

  const { playKeyPressSound, playRotorClickSound } = useEnigmaAudio()

  // Instância do motor puro Enigma
  const enigmaInstance = useMemo(() => {
    return new EnigmaMachine({
      reflector,
      rotors,
      plugboard: plugboardPairs,
    })
  }, [reflector, rotors, plugboardPairs])

  // Atualiza criptografia moderna e pacote QR sempre que o texto mudar
  const updateModernAndPacket = useCallback(
    async (
      plain: string,
      cipher: string,
      currentRotors: [RotorConfig, RotorConfig, RotorConfig],
    ) => {
      if (!cipher) {
        setModernPayload(null)
        setCurrentPacket(null)
        return
      }

      // 1. Gera cifragem AES-GCM
      const modernEnc = await encryptModern(plain, modernPassphrase)
      setModernPayload(modernEnc)

      // 2. Monta indicador de chave do protocolo: B-I-II-III:01-05-12:A-B-C
      const ringsStr = currentRotors
        .map((r) => String(r.ringSetting).padStart(2, '0'))
        .join('-')
      const posStr = currentRotors.map((r) => r.position).join('-')
      const rotorsStr = currentRotors.map((r) => r.id).join('-')
      const keyIndicator = `${reflector}-${rotorsStr}:${ringsStr}:${posStr}`

      const mac = await calculateSha256(cipher)

      setCurrentPacket({
        protocol: 'ENIGMA-NET-v1',
        sender: machineId,
        recipient: machineId === 'MACHINE_01' ? 'MACHINE_02' : 'MACHINE_01',
        keyIndicator,
        mode: 'ENIGMA',
        timestamp: Date.now(),
        payload: cipher,
        mac,
        part: 1,
        totalParts: 1,
      })
    },
    [modernPassphrase, reflector, machineId],
  )

  // Manipulador central de tecla digitada (via clique na tela ou teclado físico)
  const handleCharInput = useCallback(
    (rawChar: string) => {
      const char = rawChar.toUpperCase()
      if (!/^[A-Z]$/.test(char)) return

      if (soundEnabled) playKeyPressSound()

      setPressedKey(char)
      setTimeout(() => setPressedKey(null), 120)

      // Executa avanço e cifragem no motor puro
      const result = enigmaInstance.processChar(char)

      setActiveLampChar(result.char)
      setTimeout(() => setActiveLampChar(null), 500)

      setLastInputChar(char)
      setSignalSteps(result.signalPath)

      // Atualiza posições dos rotores refletindo o avanço mecânico
      const newRotors: [RotorConfig, RotorConfig, RotorConfig] = [
        { ...rotors[0], position: result.rotorPositions[0] },
        { ...rotors[1], position: result.rotorPositions[1] },
        { ...rotors[2], position: result.rotorPositions[2] },
      ]
      setRotors(newRotors)

      const newPlain = plaintext + char
      const newCipher = ciphertext + result.char
      setPlaintext(newPlain)
      setCiphertext(newCipher)

      updateModernAndPacket(newPlain, newCipher, newRotors)
    },
    [
      enigmaInstance,
      plaintext,
      ciphertext,
      rotors,
      soundEnabled,
      playKeyPressSound,
      updateModernAndPacket,
    ],
  )

  // Escuta teclado físico do computador
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignora se estiver digitando em campos de formulário
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.metaKey ||
        e.ctrlKey ||
        e.altKey
      ) {
        return
      }

      const key = e.key.toUpperCase()
      if (/^[A-Z]$/.test(key)) {
        e.preventDefault()
        handleCharInput(key)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleCharInput])

  // Ajuste manual de posição do rotor (Grundstellung)
  const handleRotorPositionChange = (index: 0 | 1 | 2, direction: 1 | -1) => {
    if (soundEnabled) playRotorClickSound()

    setRotors((prev) => {
      const target = prev[index]
      const currentCode = target.position.charCodeAt(0) - 65
      const newCode = (currentCode + direction + 26) % 26
      const newLetter = String.fromCharCode(65 + newCode)

      const next = [...prev] as [RotorConfig, RotorConfig, RotorConfig]
      next[index] = { ...target, position: newLetter }
      return next
    })
  }

  // Troca de rotor ou anel (com tampa aberta)
  const handleRotorConfigChange = (
    index: 0 | 1 | 2,
    id: RotorId,
    ringSetting: number,
  ) => {
    setRotors((prev) => {
      const next = [...prev] as [RotorConfig, RotorConfig, RotorConfig]
      next[index] = { ...next[index], id, ringSetting }
      return next
    })
  }

  // Carrega configuração da Folha de Chaves da Rede
  const handleSelectKeySheetMachine = (
    id: string,
    config: EnigmaMachineConfig,
  ) => {
    setMachineId(id)
    setReflector(config.reflector)
    setRotors(config.rotors)
    setPlugboardPairs(config.plugboard)
    setPlaintext('')
    setCiphertext('')
    setSignalSteps([])
    setActiveTab('ENIGMA')
  }

  // Recepção de mensagem via QR Code lido pela câmera
  const handlePacketReceived = (packet: EnigmaNetPacket) => {
    // 1. Configura a máquina com base no indicador de chave recebido
    try {
      const [part1, part2, part3] = packet.keyIndicator.split(':')
      const [refId, r1, r2, r3] = part1.split('-') as [
        ReflectorId,
        RotorId,
        RotorId,
        RotorId,
      ]
      const rings = part2.split('-').map(Number)
      const positions = part3.split('-')

      setReflector(refId)
      setRotors([
        { id: r1, ringSetting: rings[0], position: positions[0] },
        { id: r2, ringSetting: rings[1], position: positions[1] },
        { id: r3, ringSetting: rings[2], position: positions[2] },
      ])

      // 2. Decifra a mensagem usando o motor restaurado
      const receivingMachine = EnigmaMachine.fromKeyIndicator(
        packet.keyIndicator,
        plugboardPairs,
      )
      const decrypted = receivingMachine.processMessage(packet.payload)

      setPlaintext(decrypted)
      setCiphertext(packet.payload)
      setActiveTab('ENIGMA')
      alert(
        `✓ Mensagem QR recebida de ${packet.sender}!\n\nTexto Decifrado: ${decrypted}\nChave Sincronizada: ${packet.keyIndicator}`,
      )
    } catch (err: unknown) {
      alert(`Erro ao sincronizar chave recebida: ${(err as Error).message}`)
    }
  }

  const handleReset = () => {
    setPlaintext('')
    setCiphertext('')
    setSignalSteps([])
    setActiveLampChar(null)
  }

  const currentPositions: [string, string, string] = [
    rotors[0].position,
    rotors[1].position,
    rotors[2].position,
  ]

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-between selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Header */}
      <header className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-30 px-4 py-3">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 font-bold font-vintage text-xl shadow-[0_0_15px_rgba(245,158,11,0.2)]">
              E
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold font-vintage tracking-wider text-amber-400">
                ENIGMA × CRIPTOGRAFIA MODERNA
              </h1>
              <p className="text-[11px] text-zinc-400 font-mono">
                Desafio 2 • Hackathon Softwares & IoT em Ação • Campus Maricá
              </p>
            </div>
          </div>

          {/* Controles de Topo: 3D vs 2.5D, Áudio e ID */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIs3DMode(!is3DMode)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all border ${
                is3DMode
                  ? 'bg-amber-500 text-zinc-950 border-amber-400 shadow-md'
                  : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
              }`}
              title="Alternar entre Visualização 3D e Modo Leve (2.5D)"
            >
              {is3DMode ? <Layers className="w-3.5 h-3.5" /> : <Smartphone className="w-3.5 h-3.5" />}
              <span>{is3DMode ? '3D WebGL' : 'Modo Leve'}</span>
            </button>

            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-amber-400 transition-colors"
              title={soundEnabled ? 'Silenciar Efeitos' : 'Ativar Efeitos Sonoros'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <span className="text-[11px] font-mono px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-amber-400/90 font-bold">
              {machineId}
            </span>
          </div>
        </div>
      </header>

      {/* Navegação de Abas Principais */}
      <nav className="border-b border-zinc-800/60 bg-zinc-900/50 px-4 py-2">
        <div className="max-w-6xl mx-auto flex items-center justify-center sm:justify-start gap-1 sm:gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('ENIGMA')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-colors ${
              activeTab === 'ENIGMA'
                ? 'bg-amber-500 text-zinc-950 shadow-md'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Máquina Enigma</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('QR')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-colors ${
              activeTab === 'QR'
                ? 'bg-amber-500 text-zinc-950 shadow-md'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Transporte QR Code</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('MODERN')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-colors ${
              activeTab === 'MODERN'
                ? 'bg-amber-500 text-zinc-950 shadow-md'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Comparativo Moderno</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('KEYS')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-colors ${
              activeTab === 'KEYS'
                ? 'bg-amber-500 text-zinc-950 shadow-md'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Folha de Chaves</span>
          </button>
        </div>
      </nav>

      {/* Conteúdo Principal */}
      <main className="max-w-6xl mx-auto w-full p-4 sm:p-6 space-y-6 flex-1">
        {/* ABA 1: Máquina Enigma Imersiva */}
        {activeTab === 'ENIGMA' && (
          <div className="space-y-6">
            {/* Visualização 3D opcional ou Modo Leve */}
            {is3DMode && (
              <Enigma3DScene
                rotorPositions={currentPositions}
                activeChar={activeLampChar}
                pressedKey={pressedKey}
                onKeyPress={handleCharInput}
              />
            )}

            {/* Baia de Rotores e Tampa */}
            <RotorBay
              rotors={rotors}
              reflector={reflector}
              isLidOpen={isLidOpen}
              onToggleLid={() => setIsLidOpen(!isLidOpen)}
              onRotorPositionChange={handleRotorPositionChange}
              onRotorConfigChange={handleRotorConfigChange}
              onReflectorChange={(ref) => setReflector(ref)}
            />

            {/* Lampboard */}
            <Lampboard activeChar={activeLampChar} />

            {/* Teclado Físico / Virtual */}
            <Keyboard
              onKeyPress={handleCharInput}
              pressedKey={pressedKey}
            />

            {/* Painel do Plugboard */}
            <PlugboardControl
              pairs={plugboardPairs}
              onPairsChange={(pairs) => setPlugboardPairs(pairs)}
            />

            {/* Rastreamento do Sinal Elétrico em Tempo Real */}
            <SignalPathVisualizer
              steps={signalSteps}
              inputChar={lastInputChar}
              outputChar={activeLampChar}
            />

            {/* Caixas de Texto com Registro em Tempo Real */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase text-zinc-400 font-bold">
                    Klartext • Texto Original
                  </span>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="flex items-center gap-1 text-[11px] text-zinc-500 hover:text-amber-400 transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Limpar</span>
                  </button>
                </div>
                <textarea
                  readOnly
                  value={plaintext}
                  placeholder="Digite no teclado acima ou no teclado do seu computador..."
                  className="w-full h-20 bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm font-mono text-zinc-200 resize-none"
                />
              </div>

              <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase text-amber-500 font-bold">
                    Geheimtext • Texto Cifrado Enigma
                  </span>
                  <button
                    type="button"
                    onClick={() => navigator.clipboard.writeText(ciphertext)}
                    disabled={!ciphertext}
                    className="flex items-center gap-1 text-[11px] text-zinc-500 hover:text-amber-400 transition-colors disabled:opacity-40"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copiar</span>
                  </button>
                </div>
                <textarea
                  readOnly
                  value={ciphertext}
                  placeholder="O texto cifrado aparecerá aqui em tempo real..."
                  className="w-full h-20 bg-zinc-950 border border-amber-950/60 rounded-lg p-2.5 text-sm font-mono text-amber-400 font-bold tracking-wider resize-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* ABA 2: Transporte por QR Code */}
        {activeTab === 'QR' && (
          <QrCodeTransport
            currentPacket={currentPacket}
            onPacketReceived={handlePacketReceived}
            activeMachineId={machineId}
          />
        )}

        {/* ABA 3: Confronto com Criptografia Moderna */}
        {activeTab === 'MODERN' && (
          <div className="space-y-4">
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-zinc-400 font-mono">Chave Simétrica AES-256:</span>
                <input
                  type="text"
                  value={modernPassphrase}
                  onChange={(e) => setModernPassphrase(e.target.value)}
                  className="bg-zinc-950 border border-zinc-700 text-blue-300 font-mono rounded px-2 py-1 text-xs"
                />
              </div>
              <span className="text-zinc-500 text-[11px]">
                Web Crypto API nativa do navegador (`window.crypto.subtle`)
              </span>
            </div>

            <ModernComparisonPanel
              plaintext={plaintext}
              enigmaCiphertext={ciphertext}
              modernPayload={modernPayload}
              modernPassphrase={modernPassphrase}
            />
          </div>
        )}

        {/* ABA 4: Folha de Chaves da Rede */}
        {activeTab === 'KEYS' && (
          <KeySheetModal
            currentMachineId={machineId}
            onSelectMachine={handleSelectKeySheetMachine}
            currentKeyIndicator={enigmaInstance.toKeyIndicator()}
          />
        )}
      </main>

      {/* Rodapé Informativo */}
      <footer className="border-t border-zinc-800/80 bg-zinc-950/90 py-3 px-4 text-center text-xs text-zinc-500 font-mono">
        Hackathon Softwares e IoT em Ação 2026 • Desafio 2 (Comunicação Segura: Enigma × Criptografia Moderna) • Arquitetura em 3 Camadas Isoladas
      </footer>
    </div>
  )
}
