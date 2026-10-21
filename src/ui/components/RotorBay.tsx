import React from 'react'
import type { ReflectorId, RotorConfig, RotorId } from '../../core/enigma/types'
import { ChevronDown, ChevronUp, Lock, Unlock } from 'lucide-react'

interface RotorBayProps {
  rotors: [RotorConfig, RotorConfig, RotorConfig]
  reflector: ReflectorId
  isLidOpen: boolean
  onToggleLid: () => void
  onRotorPositionChange: (index: 0 | 1 | 2, direction: 1 | -1) => void
  onRotorConfigChange: (index: 0 | 1 | 2, id: RotorId, ringSetting: number) => void
  onReflectorChange: (ref: ReflectorId) => void
}

const AVAILABLE_ROTORS: RotorId[] = ['I', 'II', 'III', 'IV', 'V']
const AVAILABLE_REFLECTORS: ReflectorId[] = ['B', 'C']

export const RotorBay: React.FC<RotorBayProps> = ({
  rotors,
  reflector,
  isLidOpen,
  onToggleLid,
  onRotorPositionChange,
  onRotorConfigChange,
  onReflectorChange,
}) => {
  return (
    <div className="bg-zinc-900/95 border border-zinc-800 rounded-xl p-4 sm:p-5 shadow-2xl backdrop-blur-md">
      {/* Barra superior de controle da tampa e status */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-[11px] uppercase tracking-widest font-vintage text-amber-500 font-bold">
            Walzenlage • Rotores & Refletor
          </span>
          <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full font-mono">
            Refletor {reflector}
          </span>
        </div>

        <button
          type="button"
          onClick={onToggleLid}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-zinc-700 bg-zinc-800/90 hover:bg-zinc-700 hover:text-amber-300 text-zinc-300 transition-colors shadow-sm"
          title={isLidOpen ? 'Fechar a tampa de proteção' : 'Abrir tampa para trocar rotores'}
        >
          {isLidOpen ? (
            <>
              <Unlock className="w-3.5 h-3.5 text-amber-400" />
              <span>Tampa Aberta</span>
            </>
          ) : (
            <>
              <Lock className="w-3.5 h-3.5 text-zinc-400" />
              <span>Abrir Tampa</span>
            </>
          )}
        </button>
      </div>

      {/* Rotores visíveis e interativos */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 max-w-md mx-auto">
        {(['Esquerdo (Lento)', 'Meio', 'Direito (Rápido)'] as const).map((label, idx) => {
          const index = idx as 0 | 1 | 2
          const rotor = rotors[index]

          return (
            <div
              key={index}
              className="flex flex-col items-center bg-zinc-950/80 border border-zinc-800 rounded-lg p-2 sm:p-3 relative shadow-inner"
            >
              <span className="text-[10px] text-zinc-500 font-medium mb-1 truncate w-full text-center">
                {label}
              </span>

              {/* Botão de avanço para cima */}
              <button
                type="button"
                onClick={() => onRotorPositionChange(index, -1)}
                className="p-1 hover:text-amber-400 text-zinc-500 hover:bg-zinc-800/60 rounded transition-colors"
                title="Girar para cima"
              >
                <ChevronUp className="w-4 h-4" />
              </button>

              {/* Tambor do rotor com visor de posição */}
              <div className="my-1 w-14 sm:w-16 h-16 sm:h-20 bg-gradient-to-b from-zinc-800 via-zinc-950 to-zinc-800 rounded-md border-2 border-zinc-700 flex flex-col items-center justify-center relative overflow-hidden shadow-2xl">
                {/* Ranhuras mecânicas do disco */}
                <div className="absolute inset-x-0 top-1 h-0.5 bg-zinc-600/50" />
                <div className="absolute inset-x-0 bottom-1 h-0.5 bg-zinc-600/50" />

                {/* Letra visível no visor (Grundstellung) */}
                <span className="text-xl sm:text-2xl font-bold font-mono text-amber-400 tracking-wider">
                  {rotor.position}
                </span>

                <span className="text-[9px] text-zinc-400 font-mono mt-0.5">
                  Rotor {rotor.id}
                </span>
              </div>

              {/* Botão de avanço para baixo */}
              <button
                type="button"
                onClick={() => onRotorPositionChange(index, 1)}
                className="p-1 hover:text-amber-400 text-zinc-500 hover:bg-zinc-800/60 rounded transition-colors"
                title="Girar para baixo"
              >
                <ChevronDown className="w-4 h-4" />
              </button>

              {/* Controles de configuração acessíveis com a tampa aberta */}
              {isLidOpen && (
                <div className="mt-2 pt-2 border-t border-zinc-800 w-full flex flex-col gap-1.5 text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">Tipo:</span>
                    <select
                      value={rotor.id}
                      onChange={(e) =>
                        onRotorConfigChange(index, e.target.value as RotorId, rotor.ringSetting)
                      }
                      className="bg-zinc-900 border border-zinc-700 text-zinc-200 rounded px-1 py-0.5 font-mono text-[11px]"
                    >
                      {AVAILABLE_ROTORS.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500" title="Ringstellung (Anel)">Anel:</span>
                    <input
                      type="number"
                      min="1"
                      max="26"
                      value={rotor.ringSetting}
                      onChange={(e) =>
                        onRotorConfigChange(
                          index,
                          rotor.id,
                          Math.max(1, Math.min(26, Number(e.target.value) || 1)),
                        )
                      }
                      className="w-12 bg-zinc-900 border border-zinc-700 text-zinc-200 rounded px-1 py-0.5 font-mono text-[11px] text-center"
                    />
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Configuração de Refletor se tampa aberta */}
      {isLidOpen && (
        <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-center gap-3 text-xs">
          <span className="text-zinc-400 font-medium">Refletor (Umkehrwalze):</span>
          <div className="flex gap-2">
            {AVAILABLE_REFLECTORS.map((ref) => (
              <button
                key={ref}
                type="button"
                onClick={() => onReflectorChange(ref)}
                className={`px-3 py-1 rounded font-mono font-bold transition-colors ${
                  reflector === ref
                    ? 'bg-amber-500 text-zinc-950 shadow-md'
                    : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Refletor {ref}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
