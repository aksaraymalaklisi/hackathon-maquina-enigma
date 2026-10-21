import React from 'react'

interface LampboardProps {
  activeChar: string | null
}

const ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Z', 'U', 'I', 'O'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K'],
  ['P', 'Y', 'X', 'C', 'V', 'B', 'N', 'M', 'L'],
]

export const Lampboard: React.FC<LampboardProps> = ({ activeChar }) => {
  return (
    <div className="bg-zinc-900/90 border border-amber-950/60 rounded-xl p-4 sm:p-6 shadow-2xl backdrop-blur-md">
      <div className="text-center mb-3">
        <span className="text-[11px] uppercase tracking-widest font-vintage text-amber-500/80 font-bold">
          Lampenfeld • Painel de Lâmpadas
        </span>
      </div>

      <div className="flex flex-col items-center gap-2 sm:gap-3">
        {ROWS.map((row, rowIndex) => (
          <div key={rowIndex} className="flex justify-center gap-1.5 sm:gap-2.5">
            {row.map((char) => {
              const isActive = activeChar?.toUpperCase() === char

              return (
                <div
                  key={char}
                  className={`relative w-8 h-8 sm:w-11 sm:h-11 rounded-full flex items-center justify-center font-bold text-xs sm:text-base transition-all duration-75 border ${
                    isActive
                      ? 'bg-amber-400 text-zinc-950 border-amber-200 lamp-glow scale-110 z-10'
                      : 'bg-zinc-950/80 text-zinc-500 border-zinc-800 shadow-inner'
                  }`}
                >
                  {/* Filamento simulado */}
                  <span
                    className={`font-mono select-none ${
                      isActive ? 'drop-shadow-[0_0_8px_rgba(255,255,255,0.9)]' : 'opacity-70'
                    }`}
                  >
                    {char}
                  </span>

                  {/* Lente circular de vidro */}
                  <div
                    className={`absolute inset-0.5 rounded-full pointer-events-none ${
                      isActive
                        ? 'bg-gradient-to-t from-transparent via-amber-300/40 to-white/70'
                        : 'bg-gradient-to-b from-white/5 to-transparent'
                    }`}
                  />
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
