import React, { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Text } from '@react-three/drei'
import * as THREE from 'three'

interface Enigma3DSceneProps {
  rotorPositions: [string, string, string]
  activeChar: string | null
  pressedKey: string | null
  onKeyPress: (char: string) => void
}

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

// Rotor 3D individual com ranhuras e rotação suave
const Rotor3D: React.FC<{
  position: [number, number, number]
  letter: string
  label: string
}> = ({ position, letter, label }) => {
  const meshRef = useRef<THREE.Group>(null)
  const targetRotation = (letter.charCodeAt(0) - 65) * ((Math.PI * 2) / 26)

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x = THREE.MathUtils.lerp(
        meshRef.current.rotation.x,
        targetRotation,
        0.15,
      )
    }
  })

  return (
    <group position={position}>
      {/* Rótulo do Rotor */}
      <Text
        position={[0, 0.85, 0]}
        fontSize={0.2}
        color="#d4af37"
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>

      {/* Visor de letra atual */}
      <Text
        position={[0, 0.5, 0.4]}
        fontSize={0.28}
        color="#fbbf24"
        anchorX="center"
        anchorY="middle"
        font={undefined}
      >
        {letter}
      </Text>

      {/* Cilindro do Rotor giratório */}
      <group ref={meshRef}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.5, 0.5, 0.25, 26]} />
          <meshStandardMaterial
            color="#27272a"
            metalness={0.8}
            roughness={0.3}
          />
        </mesh>
        {/* Anel de latão chanfrado */}
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.51, 0.04, 16, 26]} />
          <meshStandardMaterial
            color="#b45309"
            metalness={0.9}
            roughness={0.2}
          />
        </mesh>
      </group>
    </group>
  )
}

// Lâmpada 3D com luz emissiva
const Lamp3D: React.FC<{
  position: [number, number, number]
  char: string
  isActive: boolean
}> = ({ position, char, isActive }) => {
  return (
    <group position={position}>
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.13, 0.13, 0.06, 16]} />
        <meshStandardMaterial
          color={isActive ? '#fbbf24' : '#18181b'}
          emissive={isActive ? '#f59e0b' : '#000000'}
          emissiveIntensity={isActive ? 2.5 : 0}
          roughness={0.3}
        />
      </mesh>
      <Text
        position={[0, 0.09, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.12}
        color={isActive ? '#000000' : '#71717a'}
        anchorX="center"
        anchorY="middle"
      >
        {char}
      </Text>
      {isActive && (
        <pointLight position={[0, 0.3, 0]} color="#f59e0b" intensity={2.0} distance={1.5} />
      )}
    </group>
  )
}

export const Enigma3DScene: React.FC<Enigma3DSceneProps> = ({
  rotorPositions,
  activeChar,
}) => {
  return (
    <div className="w-full h-80 sm:h-96 rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950 relative shadow-2xl">
      <div className="absolute top-3 left-3 z-10 pointer-events-none">
        <span className="text-[10px] bg-zinc-900/80 text-amber-400 border border-amber-900/60 px-2.5 py-1 rounded-full font-mono uppercase tracking-wider backdrop-blur-md">
          Three.js Canvas • Câmera Livre 3D
        </span>
      </div>

      <Canvas camera={{ position: [0, 3.8, 3.5], fov: 45 }}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 8, 5]} intensity={1.2} castShadow />
        <pointLight position={[-4, 4, -2]} intensity={0.5} color="#eab308" />

        {/* Chassi da Máquina Enigma em Madeira/Metal */}
        <mesh position={[0, -0.2, 0]}>
          <boxGeometry args={[4.2, 0.5, 3.8]} />
          <meshStandardMaterial
            color="#1c1917" // Madeira nobre escura
            roughness={0.7}
            metalness={0.1}
          />
        </mesh>

        {/* Placa Metálica Interna */}
        <mesh position={[0, 0.06, 0]}>
          <boxGeometry args={[3.9, 0.05, 3.5]} />
          <meshStandardMaterial
            color="#27272a"
            metalness={0.7}
            roughness={0.4}
          />
        </mesh>

        {/* 3 Rotores Interativos */}
        <group position={[0, 0.3, -0.9]}>
          <Rotor3D position={[-0.8, 0, 0]} letter={rotorPositions[0]} label="Rotor I" />
          <Rotor3D position={[0, 0, 0]} letter={rotorPositions[1]} label="Rotor II" />
          <Rotor3D position={[0.8, 0, 0]} letter={rotorPositions[2]} label="Rotor III" />
        </group>

        {/* Lampboard 3D (disposição reduzida estilizada) */}
        <group position={[0, 0.1, 0.3]}>
          {ALPHABET.slice(0, 9).map((char, i) => (
            <Lamp3D
              key={char}
              position={[(i - 4) * 0.35, 0, -0.3]}
              char={char}
              isActive={activeChar === char}
            />
          ))}
          {ALPHABET.slice(9, 17).map((char, i) => (
            <Lamp3D
              key={char}
              position={[(i - 3.5) * 0.35, 0, 0]}
              char={char}
              isActive={activeChar === char}
            />
          ))}
          {ALPHABET.slice(17, 26).map((char, i) => (
            <Lamp3D
              key={char}
              position={[(i - 4) * 0.35, 0, 0.3]}
              char={char}
              isActive={activeChar === char}
            />
          ))}
        </group>

        <OrbitControls
          enablePan={false}
          maxPolarAngle={Math.PI / 2.1}
          minDistance={2.5}
          maxDistance={7}
        />
      </Canvas>
    </div>
  )
}
