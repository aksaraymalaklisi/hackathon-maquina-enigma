import React, { useState } from 'react'
import { Trash2, X } from 'lucide-react'

interface PlugboardControlProps {
  pairs: string[]
  onPairsChange: (pairs: string[]) => void
}

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

const WIRE_COLORS = [
  '#ef4444', // Vermelho
  '#3b82f6', // Azul
  '#10b981', // Verde
  '#f59e0b', // Âmbar
  '#8b5cf6', // Violeta
  '#ec4899', // Rosa
  '#06b6d4', // Ciano
  '#eab308', // Amarelo
  '#f97316', // Laranja
  '#a855f7', // Roxo
]

export const PlugboardControl: React.FC<PlugboardControlProps> = ({
  pairs,
  onPairsChange,
}) => {
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Mapeia cada letra conectada à sua contraparte e à cor do cabo
  const letterToConnection = new Map<string, { partner: string; color: string }>()
  pairs.forEach((pair, idx) => {
    const a = pair[0]
    const b = pair[1]
    const color = WIRE_COLORS[idx % WIRE_COLORS.length]
    letterToConnection.set(a, { partner: b, color })
    letterToConnection.set(b, { partner: a, color })
  })

  const handleLetterClick = (letter: string) => {
    setErrorMsg(null)

    // Se já estiver conectada, remove a conexão existente
    if (letterToConnection.has(letter)) {
      const partner = letterToConnection.get(letter)!.partner
      const pairStr = pairs.find((p) => p.includes(letter) && p.includes(partner))
      if (pairStr) {
        onPairsChange(pairs.filter((p) => p !== pairStr))
      }
      setSelectedLetter(null)
      return
    }

    // Se nenhuma estiver selecionada, seleciona como origem
    if (!selectedLetter) {
      setSelectedLetter(letter)
      return
    }

    // Se clicou na mesma letra, desmarca
    if (selectedLetter === letter) {
      setSelectedLetter(null)
      return
    }

    // Tenta conectar selectedLetter com letter
    if (pairs.length >= 10) {
      setErrorMsg('Máximo histórico de 10 pares (20 cabos) atingido.')
      setSelectedLetter(null)
      return
    }

    const newPair = `${selectedLetter}${letter}`
    onPairsChange([...pairs, newPair])
    setSelectedLetter(null)
  }

  const handleRemovePair = (pairToRemove: string) => {
    onPairsChange(pairs.filter((p) => p !== pairToRemove))
  }

  const handleClearAll = () => {
    onPairsChange([])
    setSelectedLetter(null)
    setErrorMsg(null)
  }

  return (
    <div className="bg-zinc-900/95 border border-zinc-800 rounded-xl p-4 sm:p-5 shadow-2xl backdrop-blur-md">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
        <div>
          <span className="text-[11px] uppercase tracking-widest font-vintage text-amber-500 font-bold block">
            Steckerbrett • Painel de Conexões (Plugboard)
          </span>
          <span className="text-xs text-zinc-400">
            {pairs.length}/10 pares conectados (clique em 2 letras para plugar um cabo)
          </span>
        </div>

        {pairs.length > 0 && (
          <button
            type="button"
            onClick={handleClearAll}
            className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 px-2 py-1 bg-red-950/40 border border-red-900/50 rounded transition-colors"
            title="Remover todas as conexões"
          >
            <Trash2 className="w-3 h-3" />
            <span>Limpar</span>
          </button>
        )}
      </div>

      {errorMsg && (
        <div className="mb-3 p-2 bg-red-900/30 border border-red-800/60 rounded text-red-300 text-xs text-center font-mono">
          {errorMsg}
        </div>
      )}

      {/* Grade de 26 soquetes do plugboard */}
      <div className="grid grid-cols-6 sm:grid-cols-9 md:grid-cols-13 gap-1.5 sm:gap-2 mb-4">
        {ALPHABET.map((char) => {
          const conn = letterToConnection.get(char)
          const isSelected = selectedLetter === char

          return (
            <button
              key={char}
              type="button"
              onClick={() => handleLetterClick(char)}
              className={`relative flex flex-col items-center justify-center p-1.5 sm:p-2 rounded-lg border transition-all ${
                isSelected
                  ? 'border-amber-400 bg-amber-500/20 shadow-lg scale-105'
                  : conn
                    ? 'border-zinc-700 bg-zinc-950 shadow-md'
                    : 'border-zinc-800 bg-zinc-950/60 hover:border-zinc-600 hover:bg-zinc-800/50'
              }`}
            >
              <span className="font-mono font-bold text-xs sm:text-sm text-zinc-200">
                {char}
              </span>

              {/* Soquete físico simulado */}
              <div
                className="w-3 h-3 rounded-full mt-1 border flex items-center justify-center"
                style={{
                  backgroundColor: conn ? conn.color : '#18181b',
                  borderColor: conn ? conn.color : '#3f3f46',
                  boxShadow: conn ? `0 0 6px ${conn.color}` : 'inset 0 1px 2px #000',
                }}
              />

              {conn && (
                <span
                  className="text-[9px] font-mono mt-0.5 truncate font-semibold"
                  style={{ color: conn.color }}
                >
                  ↔{conn.partner}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Lista de cabos ativos em chips */}
      {pairs.length > 0 && (
        <div className="flex flex-wrap gap-1.5 items-center pt-3 border-t border-zinc-800/80">
          <span className="text-[11px] text-zinc-400 font-medium mr-1">Cabos:</span>
          {pairs.map((pair, idx) => {
            const color = WIRE_COLORS[idx % WIRE_COLORS.length]
            return (
              <span
                key={pair}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-mono font-bold border"
                style={{
                  backgroundColor: `${color}15`,
                  borderColor: color,
                  color,
                }}
              >
                {pair[0]} ↔ {pair[1]}
                <button
                  type="button"
                  onClick={() => handleRemovePair(pair)}
                  className="hover:opacity-75 transition-opacity"
                  title="Desconectar cabo"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )
          })}
        </div>
      )}
    </div>
  )
}
