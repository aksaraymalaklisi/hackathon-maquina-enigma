import React from 'react'
import { SHARED_KEY_SHEET } from '../../core/enigma/keySheet'
import type { EnigmaMachineConfig } from '../../core/enigma/types'
import { BookOpen, Check, Copy, Radio } from 'lucide-react'

interface KeySheetModalProps {
  currentMachineId: string
  onSelectMachine: (machineId: string, config: EnigmaMachineConfig) => void
  currentKeyIndicator: string
}

export const KeySheetModal: React.FC<KeySheetModalProps> = ({
  currentMachineId,
  onSelectMachine,
  currentKeyIndicator,
}) => {
  const [copied, setCopied] = React.useState(false)

  const handleCopyIndicator = () => {
    navigator.clipboard.writeText(currentKeyIndicator)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-zinc-900/95 border border-zinc-800 rounded-xl p-4 sm:p-5 shadow-2xl backdrop-blur-md">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-amber-500" />
          <span className="text-xs uppercase font-vintage text-amber-500 font-bold tracking-wider">
            Tagesschlüssel • Folha de Chaves da Rede
          </span>
        </div>

        <button
          type="button"
          onClick={handleCopyIndicator}
          className="flex items-center gap-1.5 text-xs font-mono text-zinc-300 hover:text-amber-300 px-2 py-1 bg-zinc-800 rounded border border-zinc-700 transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>Copiar Chave Atual</span>
        </button>
      </div>

      <p className="text-xs text-zinc-400 mb-3">
        Selecione uma das 4 máquinas virtuais para carregar a configuração da folha de chaves compartilhada:
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {Object.entries(SHARED_KEY_SHEET).map(([machineId, config]) => {
          const isCurrent = currentMachineId === machineId

          return (
            <div
              key={machineId}
              className={`p-3 rounded-lg border transition-all ${
                isCurrent
                  ? 'border-amber-500 bg-amber-950/20 shadow-md'
                  : 'border-zinc-800 bg-zinc-950/60 hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-mono font-bold text-xs text-zinc-200 flex items-center gap-1.5">
                  <Radio className={`w-3.5 h-3.5 ${isCurrent ? 'text-amber-400' : 'text-zinc-600'}`} />
                  {machineId}
                </span>

                <button
                  type="button"
                  onClick={() => onSelectMachine(machineId, config)}
                  className={`text-[11px] font-bold px-2 py-0.5 rounded transition-colors ${
                    isCurrent
                      ? 'bg-amber-500 text-zinc-950'
                      : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                  }`}
                >
                  {isCurrent ? 'Ativa' : 'Sincronizar'}
                </button>
              </div>

              <div className="text-[11px] font-mono text-zinc-400 space-y-0.5">
                <div>
                  Refletor: <span className="text-zinc-200">{config.reflector}</span> | Rotores:{' '}
                  <span className="text-zinc-200">
                    {config.rotors.map((r) => r.id).join('-')}
                  </span>
                </div>
                <div>
                  Anéis:{' '}
                  <span className="text-zinc-200">
                    {config.rotors.map((r) => String(r.ringSetting).padStart(2, '0')).join('-')}
                  </span>{' '}
                  | Posições:{' '}
                  <span className="text-zinc-200">{config.rotors.map((r) => r.position).join('-')}</span>
                </div>
                <div className="truncate">
                  Plugboard:{' '}
                  <span className="text-amber-400/90 text-[10px]">{config.plugboard.join(' ')}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
