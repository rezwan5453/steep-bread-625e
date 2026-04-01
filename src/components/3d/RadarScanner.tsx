import React, { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const DOTS = Array.from({ length: 12 }, (_, i) => ({
  x: (Math.random() - 0.5) * 3,
  y: (Math.random() - 0.5) * 3,
  phase: Math.random() * Math.PI * 2,
}))

function RadarScene() {
  const sweepRef = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    if (sweepRef.current) {
      sweepRef.current.rotation.z = -clock.getElapsedTime() * 1.2
    }
  })

  return (
    <>
      {/* Concentric circles */}
      {[0.8, 1.6, 2.4, 3.2].map((r, i) => (
        <mesh key={i}>
          <ringGeometry args={[r - 0.01, r, 64]} />
          <meshBasicMaterial color="#00ff41" transparent opacity={0.15} />
        </mesh>
      ))}
      {/* Cross hairs */}
      {[0, Math.PI / 2].map((rot, i) => (
        <mesh key={`line-${i}`} rotation={[0, 0, rot]}>
          <planeGeometry args={[6.4, 0.01]} />
          <meshBasicMaterial color="#00ff41" transparent opacity={0.1} />
        </mesh>
      ))}
      {/* Sweep */}
      <mesh ref={sweepRef}>
        <circleGeometry args={[3.2, 64, 0, Math.PI / 6]} />
        <meshBasicMaterial color="#00ff41" transparent opacity={0.18} side={THREE.DoubleSide} />
      </mesh>
      {/* Blinking dots */}
      {DOTS.map((d, i) => (
        <BlinkDot key={i} x={d.x} y={d.y} phase={d.phase} />
      ))}
    </>
  )
}

function BlinkDot({ x, y, phase }: { x: number; y: number; phase: number }) {
  const ref = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    if (ref.current) {
      const mat = ref.current.material as THREE.MeshBasicMaterial
      mat.opacity = 0.3 + Math.abs(Math.sin(clock.getElapsedTime() * 2 + phase)) * 0.6
    }
  })
  return (
    <mesh ref={ref} position={[x, y, 0]}>
      <circleGeometry args={[0.04, 8]} />
      <meshBasicMaterial color="#00ff41" transparent opacity={0.5} />
    </mesh>
  )
}

export function RadarScanner() {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', opacity: 0.12 }}>
      <Canvas camera={{ position: [0, 0, 5], fov: 60 }} frameloop="always" dpr={[1, 1.5]}>
        <RadarScene />
      </Canvas>
    </div>
  )
}
