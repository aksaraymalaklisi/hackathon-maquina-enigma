import React, { useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import {
  Bug,
  CheckCircle2,
  Clock,
  KeyRound,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react'
import {
  AES_256_METRICS,
  ENIGMA_METRICS,
  analyzeFrequency,
  verifyEnigmaFlaw,
} from '../../core/modern/comparison'
import type { ModernEncryptedPayload } from '../../core/modern/types'
import { tamperPayload, decryptModern } from '../../core/modern/aes'

interface ModernComparisonPanelProps {
  plaintext: string
  enigmaCiphertext: string
  modernPayload: ModernEncryptedPayload | null
  modernPassphrase: string
}

export const ModernComparisonPanel: React.FC<ModernComparisonPanelProps> = ({
  plaintext,
  enigmaCiphertext,
  modernPayload,
  modernPassphrase,
}) => {
  const [tamperTestResult, setTamperTestResult] = useState<string | null>(null)

  const frequencyData = analyzeFrequency(plaintext, enigmaCiphertext)
  const flawCheck = verifyEnigmaFlaw(plaintext, enigmaCiphertext)

  const handleSimulateTamper = async () => {
    if (!modernPayload) return

    // Altera 1 bit do payload AES
    const tampered = tamperPayload(modernPayload)

    // Tenta decifrar o payload adulterado
    const result = await decryptModern(tampered, modernPassphrase)
    if (!result.success) {
      setTamperTestResult(
        `🚨 ADULTERAÇÃO DETECTADA: ${result.error}`,
      )
    } else {
      setTamperTestResult('Falha na detecção.')
    }
  }

  return (
    <div className="bg-zinc-900/95 border border-zinc-800 rounded-xl p-4 sm:p-6 shadow-2xl backdrop-blur-md space-y-6">
      {/* Cabeçalho */}
      <div className="border-b border-zinc-800 pb-3">
        <h2 className="text-base sm:text-lg font-bold font-vintage text-amber-500 tracking-wide flex items-center gap-2">
          <KeyRound className="w-5 h-5 text-amber-400" />
          Confronto Analítico: Enigma M3 vs AES-256-GCM
        </h2>
        <p className="text-xs text-zinc-400 mt-1">
          Comparação algorítmica direta entre a cifra eletromecânica de 1940 e o padrão moderno autenticado.
        </p>
      </div>

      {/* Cartões Comparativos lado a lado */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Lado Enigma */}
        <div className="bg-zinc-950/80 border border-zinc-800 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="font-vintage font-bold text-amber-400 text-sm">
              {ENIGMA_METRICS.algorithm}
            </span>
            <span className="text-[10px] bg-amber-950/60 text-amber-400 border border-amber-800 px-2 py-0.5 rounded-full font-mono">
              67 bits efetivos
            </span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div>
              <span className="text-zinc-500 block">Espaço de Estados:</span>
              <span className="text-zinc-200 font-bold">{ENIGMA_METRICS.keySpaceScientific}</span>
            </div>
            <div>
              <span className="text-zinc-500 block flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-zinc-400" /> Tempo de Força Bruta:
              </span>
              <span className="text-amber-400">{ENIGMA_METRICS.bruteForceTimeText}</span>
            </div>
            <div>
              <span className="text-zinc-500 block flex items-center gap-1">
                <Bug className="w-3.5 h-3.5 text-red-400" /> Falha Fundamental (E(x) ≠ x):
              </span>
              <span className="text-red-400 font-bold">
                Presente (explorada por Alan Turing na Bombe)
              </span>
            </div>
            <div>
              <span className="text-zinc-500 block flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5 text-red-400" /> Detecção de Adulteração:
              </span>
              <span className="text-red-400">Ausente (texto cifrado adulterado não gera erro)</span>
            </div>
          </div>
        </div>

        {/* Lado AES-256 */}
        <div className="bg-zinc-950/80 border border-zinc-800 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="font-vintage font-bold text-blue-400 text-sm">
              {AES_256_METRICS.algorithm}
            </span>
            <span className="text-[10px] bg-blue-950/60 text-blue-400 border border-blue-800 px-2 py-0.5 rounded-full font-mono">
              256 bits simétricos
            </span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div>
              <span className="text-zinc-500 block">Espaço de Estados:</span>
              <span className="text-zinc-200 font-bold">{AES_256_METRICS.keySpaceScientific}</span>
            </div>
            <div>
              <span className="text-zinc-500 block flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-zinc-400" /> Tempo de Força Bruta:
              </span>
              <span className="text-blue-400">{AES_256_METRICS.bruteForceTimeText}</span>
            </div>
            <div>
              <span className="text-zinc-500 block flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-400" /> Permutação Pseudorrandômica:
              </span>
              <span className="text-green-400">Segura (sem preservação de auto-exclusão)</span>
            </div>
            <div>
              <span className="text-zinc-500 block flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-green-400" /> Tag de Autenticação (GHASH):
              </span>
              <span className="text-green-400 font-bold">128 bits com rejeição criptográfica</span>
            </div>
          </div>
        </div>
      </div>

      {/* Prova da Falha Clássica da Enigma ao vivo */}
      <div className="bg-zinc-950/60 border border-zinc-800 rounded-lg p-3.5">
        <h3 className="text-xs font-bold font-vintage text-zinc-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Bug className="w-4 h-4 text-amber-500" />
          Verificação da Falha Histórica da Enigma na Mensagem Atual
        </h3>

        {plaintext ? (
          <div className="text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="text-zinc-400">Total de caracteres inspecionados:</span>
              <span className="text-zinc-200 font-bold">{flawCheck.totalChecks}</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-zinc-400">Caracteres cifrados como si mesmos (E(x) = x):</span>
              <span className="text-green-400 font-bold">{flawCheck.selfEncryptedCount} (0%)</span>
            </div>
            <p className="text-[11px] text-amber-400/90 mt-2">
              ✓ <strong>Prova Criptográfica:</strong> Nenhuma letra na Enigma é cifrada como ela mesma. Isso permitiu que os matemáticos de Bletchley Park eliminassem milhares de posições do rotor instantaneamente usando palavras prováveis (cribs).
            </p>
          </div>
        ) : (
          <p className="text-xs text-zinc-500 font-mono">
            Digite uma mensagem para calcular a verificação de auto-cifragem em tempo real.
          </p>
        )}
      </div>

      {/* Demonstração ao Vivo de Detecção de Adulteração (Tampering) */}
      <div className="bg-zinc-950/60 border border-zinc-800 rounded-lg p-3.5 space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold font-vintage text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-red-400" />
            Prova ao Vivo: Detecção de Adulteração (Man-in-the-Middle)
          </h3>
          <button
            type="button"
            onClick={handleSimulateTamper}
            disabled={!modernPayload}
            className="px-3 py-1 bg-red-950/80 hover:bg-red-900 border border-red-700 text-red-200 text-xs font-mono font-bold rounded-md transition-colors disabled:opacity-40"
          >
            Adulterar 1 bit no AES
          </button>
        </div>

        <p className="text-[11px] text-zinc-400">
          Enquanto a Enigma decifra alegremente texto corrompido sem alertar ninguém, o AES-GCM moderno calcula uma tag GHASH de autenticação que rejeita qualquer bit modificado no transporte.
        </p>

        {tamperTestResult && (
          <div className="p-2.5 bg-red-950/40 border border-red-800 rounded-lg text-xs font-mono text-red-300">
            {tamperTestResult}
          </div>
        )}
      </div>

      {/* Gráfico de Análise de Frequência Recharts */}
      {plaintext.length > 5 && (
        <div className="bg-zinc-950/60 border border-zinc-800 rounded-lg p-3.5">
          <h3 className="text-xs font-bold font-vintage text-zinc-300 uppercase tracking-wider mb-3">
            Análise de Frequência: Texto Aberto vs Cifra Enigma
          </h3>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={frequencyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="letter" stroke="#71717a" fontSize={10} />
                <YAxis stroke="#71717a" fontSize={10} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    borderColor: '#3f3f46',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontFamily: 'monospace',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="plainCount" name="Texto Aberto" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                <Bar dataKey="enigmaCount" name="Cifra Enigma" fill="#f59e0b" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  )
}
