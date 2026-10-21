import React from 'react'

interface KeyboardProps {
  onKeyPress: (char: string) => void
  disabled?: boolean
  pressedKey?: string | null
}

const ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Z', 'U', 'I', 'O'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K'],
  ['P', 'Y', 'X', 'C', 'V', 'B', 'N', 'M', 'L'],
]

export const Keyboard: React.FC<KeyboardProps> = ({
  onKeyPress,
  disabled = false,
  pressedKey,
}) => {
  return (
    <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-4 sm:p-6 shadow-2xl backdrop-blur-md">
      <div className="text-center mb-3">
        <span className="text-[11px] uppercase tracking-widest font-vintage text-zinc-400 font-bold">
          Tastatur • Teclado Mecânico
        </span>
      </div>

      <div className="flex flex-col items-center gap-2 sm:gap-3">
        {ROWS.map((row, rowIndex) => (
          <div key={rowIndex} className="flex justify-center gap-1.5 sm:gap-2.5">
            {row.map((char) => {
              const isPressed = pressedKey?.toUpperCase() === char

              return (
                <button
                  key={char}
                  type="button"
                  disabled={disabled}
                  onClick={() => onKeyPress(char)}
                  className={`group relative w-8 h-8 sm:w-11 sm:h-11 rounded-full flex items-center justify-center font-bold text-xs sm:text-base select-none transition-transform duration-75 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                    isPressed ? 'key-pressed' : ''
                  }`}
                  style={{
                    background: 'radial-gradient(circle at 35% 35%, #27272a, #09090b)',
                    boxShadow: isPressed
                      ? 'inset 0 4px 8px rgba(0,0,0,0.9), 0 1px 2px rgba(255,255,255,0.1)'
                      : '0 4px 6px -1px rgba(0, 0, 0, 0.7), 0 2px 4px -2px rgba(0, 0, 0, 0.7), inset 0 1px 1px rgba(255,255,255,0.2)',
                    border: '2px solid #52525b',
                  }}
                  title={`Pressione ${char}`}
                >
                  {/* Anel de latão decorativo interno */}
                  <div className="absolute inset-0.5 rounded-full border border-amber-600/30 pointer-events-none" />

                  <span className="font-mono text-zinc-200 group-hover:text-amber-400 transition-colors">
                    {char}
                  </span>
                </button>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
