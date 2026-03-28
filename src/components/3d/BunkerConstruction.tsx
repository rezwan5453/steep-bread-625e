import React, { useEffect, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useSpring, animated } from '@react-spring/three'
import * as THREE from 'three'

const MESSAGES = [
  'ANALYZING RESPONSES...',
  'CALCULATING THREAT VECTORS...',
  'ASSESSING RESOURCE INVENTORY...',
  'COMPUTING SURVIVAL PROBABILITY...',
  'GENERATING TACTICAL PLAN...',
  'COMPILING URGENT ACTIONS...',
  'FINALIZING YOUR DOSSIER...',
]

const BOX_COLORS = ['#1a1a1a', '#1a1a1a', '#222', '#1a1a1a', '#1e1e1e', '#1a1a1a', '#c8a84b']

function Block({ index, active }: { index: number; active: boolean }) {
  const targetY = index * 0.42 - 1.2
  const { posY, opacity } = useSpring({
    posY: active ? targetY : targetY + 8,
    opacity: active ? 1 : 0,
    delay: index * 200,
    config: { mass: 1, tension: 120, friction: 20 },
  })

  return (
    <animated.mesh position-x={0} position-y={posY} position-z={0}>
      <boxGeometry args={[2.5, 0.35, 1.2]} />
      <meshStandardMaterial
        color={BOX_COLORS[index % BOX_COLORS.length]}
        metalness={index === 6 ? 0.8 : 0.2}
        roughness={0.6}
        emissive={index === 6 ? '#c8a84b' : '#000'}
        emissiveIntensity={index === 6 ? 0.2 : 0}
      />
    </animated.mesh>
  )
}

function BunkerScene({ progress }: { progress: number }) {
  const groupRef = React.useRef<THREE.Group>(null)
  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.3
  })

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[3, 3, 3]} intensity={1} color="#c8a84b" />
      <pointLight position={[-3, -2, -3]} intensity={0.4} color="#4466aa" />
      <group ref={groupRef}>
        {Array.from({ length: 7 }).map((_, i) => (
          <Block key={i} index={i} active={progress > i * 14} />
        ))}
      </group>
    </>
  )
}

interface BunkerConstructionProps {
  onComplete?: () => void
}

export function BunkerConstruction({ onComplete }: BunkerConstructionProps) {
  const [progress, setProgress] = useState(0)
  const [msgIdx, setMsgIdx] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(p => {
        const next = p + 2
        if (next >= 100) {
          clearInterval(interval)
          setTimeout(() => onComplete?.(), 500)
        }
        return Math.min(100, next)
      })
    }, 60)
    return () => clearInterval(interval)
  }, [onComplete])

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIdx(i => (i + 1) % MESSAGES.length)
    }, 700)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed inset-0 z-50 bg-[#0a0a0a] flex flex-col items-center justify-center">
      <div style={{ width: 320, height: 320 }}>
        <Canvas camera={{ position: [0, 0, 5], fov: 45 }} dpr={[1, 2]}>
          <BunkerScene progress={progress} />
        </Canvas>
      </div>
      <div className="mt-4 text-[#c8a84b] font-mono uppercase tracking-widest text-sm min-h-[1.5rem]">
        {MESSAGES[msgIdx]}
      </div>
      <div className="mt-4 w-64 h-1 bg-[#1a1a1a]">
        <div
          className="h-full bg-[#c8a84b] transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="mt-2 text-[#555] font-mono text-xs tracking-widest">{progress}%</div>
    </div>
  )
}
