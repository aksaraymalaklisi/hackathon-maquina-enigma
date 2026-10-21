import { useCallback, useRef } from 'react'

/**
 * Sintetizador procedural de áudio mecânico usando a Web Audio API nativa.
 * Gera sons mecânicos autênticos de máquina de escrever / Enigma (clique metálico,
 * estalo de mola e catraca do rotor) sem depender de arquivos de áudio externos.
 */
export function useEnigmaAudio() {
  const audioCtxRef = useRef<AudioContext | null>(null)

  const getAudioContext = useCallback(() => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      audioCtxRef.current = new AudioCtx()
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume()
    }
    return audioCtxRef.current
  }, [])

  /**
   * Som de tecla mecânica pressionada (impacto pesado + clique agudo)
   */
  const playKeyPressSound = useCallback(() => {
    try {
      const ctx = getAudioContext()
      const now = ctx.currentTime

      // 1. Ruído de impacto metálico (metal snap)
      const bufferSize = ctx.sampleRate * 0.04 // 40ms
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
      const data = buffer.getChannelData(0)
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.15))
      }

      const noise = ctx.createBufferSource()
      noise.buffer = buffer

      const filter = ctx.createBiquadFilter()
      filter.type = 'bandpass'
      filter.frequency.setValueAtTime(1400, now)
      filter.Q.setValueAtTime(3.0, now)

      const noiseGain = ctx.createGain()
      noiseGain.gain.setValueAtTime(0.35, now)
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04)

      noise.connect(filter)
      filter.connect(noiseGain)
      noiseGain.connect(ctx.destination)
      noise.start(now)

      // 2. Ressonância do chassi (corpo de metal fundido)
      const osc = ctx.createOscillator()
      const oscGain = ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(180, now)
      osc.frequency.exponentialRampToValueAtTime(60, now + 0.06)

      oscGain.gain.setValueAtTime(0.25, now)
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06)

      osc.connect(oscGain)
      oscGain.connect(ctx.destination)
      osc.start(now)
      osc.stop(now + 0.06)
    } catch {
      // Ignora silenciosamente caso o navegador bloqueie áudio antes de interação
    }
  }, [getAudioContext])

  /**
   * Som da catraca do rotor girando
   */
  const playRotorClickSound = useCallback(() => {
    try {
      const ctx = getAudioContext()
      const now = ctx.currentTime

      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(650, now)
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.03)

      gain.gain.setValueAtTime(0.18, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03)

      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now)
      osc.stop(now + 0.03)
    } catch {
      // fallback
    }
  }, [getAudioContext])

  return {
    playKeyPressSound,
    playRotorClickSound,
  }
}
