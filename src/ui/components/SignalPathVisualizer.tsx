import React from 'react'
import type { SignalPathStep } from '../../core/enigma/types'
import { ArrowRight, Zap } from 'lucide-react'

interface SignalPathVisualizerProps {
  steps: SignalPathStep[]
  inputChar: string | null
  outputChar: string | null
}

export const SignalPathVisualizer: React.FC<SignalPathVisualizerProps> = ({
  steps,
  inputChar,
  outputChar,
}) => {
  if (!inputChar || !outputChar || steps.length === 0) {
    return (
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 text-center text-xs text-zinc-500">
        Pressione uma tecla para visualizar o caminho elétrico em tempo real.
      </div>
    )
  }

  return (
    <div className="bg-zinc-900/95 border border-amber-900/40 rounded-xl p-4 sm:p-5 shadow-2xl backdrop-blur-md">
      <div className="flex items-center gap-2 mb-3 border-b border-zinc-800 pb-2">
        <Zap className="w-4 h-4 text-amber-400 animate-pulse" />
        <span className="text-xs uppercase font-vintage text-amber-400 font-bold tracking-wider">
          Circuito Elétrico em Tempo Real ({inputChar} ➔ {outputChar})
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[11px] font-mono">
        {/* Entrada Tecla */}
        <div className="px-2 py-1 bg-zinc-950 border border-amber-600 rounded text-amber-300 font-bold">
          Tecla: {inputChar}
        </div>

        {steps.map((step, idx) => (
          <React.Fragment key={idx}>
            <ArrowRight className="w-3 h-3 text-zinc-600 flex-shrink-0" />
            <div
              className={`px-2 py-1 rounded border flex-shrink-0 ${
                step.component.includes('Refletor')
                  ? 'bg-purple-950/60 border-purple-700 text-purple-300 font-bold shadow-[0_0_8px_rgba(168,85,247,0.4)]'
                  : step.component.includes('Retorno')
                    ? 'bg-blue-950/40 border-blue-800 text-blue-300'
                    : 'bg-zinc-950/80 border-zinc-700 text-zinc-300'
              }`}
              title={`${step.component}: ${step.inputChar} -> ${step.outputChar}`}
            >
              <span className="text-[10px] text-zinc-400 block truncate max-w-[110px]">
                {step.component}
              </span>
              <span className="font-bold">
                {step.inputChar} ➔ {step.outputChar}
              </span>
            </div>
          </React.Fragment>
        ))}

        <ArrowRight className="w-3 h-3 text-zinc-600 flex-shrink-0" />
        {/* Saída Lâmpada */}
        <div className="px-2 py-1 bg-amber-400 text-zinc-950 rounded font-bold shadow-[0_0_12px_rgba(251,191,36,0.6)]">
          Lâmpada: {outputChar}
        </div>
      </div>
    </div>
  )
}
