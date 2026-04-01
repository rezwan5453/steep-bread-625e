import React, { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { useSpring, animated } from '@react-spring/three'
import * as THREE from 'three'

function getScoreColor(score: number): string {
  if (score >= 70) return '#3a7d44'
  if (score >= 40) return '#c8a84b'
  return '#cc3333'
}

function DialScene({ score }: { score: number }) {
  const needleRef = useRef<THREE.Mesh>(null)
  const targetAngle = useRef(0)
  const { angle } = useSpring({
    angle: (-Math.PI * 0.75) + (score / 100) * (Math.PI * 1.5),
    config: { mass: 2, tension: 30, friction: 20 },
  })

  useFrame(() => {
    if (needleRef.current) {
      needleRef.current.rotation.z = targetAngle.current
    }
  })

  const color = getScoreColor(score)

  const arcs = [
    { color: '#cc3333', start: 0, end: 0.4 },
    { color: '#c8a84b', start: 0.4, end: 0.7 },
    { color: '#3a7d44', start: 0.7, end: 1 },
  ]

  return (
    <>
      <ambientLight intensity={0.6} />
      <pointLight position={[0, 0, 3]} intensity={1} color="#ffffff" />
      {/* Background disc */}
      <mesh position={[0, 0, -0.1]}>
        <circleGeometry args={[1.6, 64]} />
        <meshStandardMaterial color="#111111" />
      </mesh>
      {/* Arc segments */}
      {arcs.map((arc, i) => {
        const startAngle = Math.PI * 0.75 + arc.start * Math.PI * 1.5
        const endAngle = Math.PI * 0.75 + arc.end * Math.PI * 1.5
        return (
          <mesh key={i}>
            <ringGeometry args={[1.3, 1.5, 64, 1, startAngle, endAngle - startAngle]} />
            <meshBasicMaterial color={arc.color} side={THREE.DoubleSide} />
          </mesh>
        )
      })}
      {/* Tick marks */}
      {Array.from({ length: 11 }).map((_, i) => {
        const a = Math.PI * 0.75 + (i / 10) * Math.PI * 1.5
        const x1 = Math.cos(a) * 1.2
        const y1 = Math.sin(a) * 1.2
        return (
          <mesh key={`tick-${i}`} position={[x1, y1, 0]}>
            <circleGeometry args={[0.03, 8]} />
            <meshBasicMaterial color="#555" />
          </mesh>
        )
      })}
      {/* Needle */}
      <animated.mesh rotation-z={angle} position={[0, 0, 0.1]}>
        <mesh position={[0, 0.55, 0]}>
          <planeGeometry args={[0.06, 1.1]} />
          <meshBasicMaterial color={color} side={THREE.DoubleSide} />
        </mesh>
        <mesh>
          <circleGeometry args={[0.1, 16]} />
          <meshBasicMaterial color="#333" />
        </mesh>
      </animated.mesh>
      {/* Score label */}
      <Html center position={[0, -0.5, 0.2]}>
        <div style={{ fontFamily: 'monospace', color, fontSize: 28, fontWeight: 700, textAlign: 'center', textShadow: `0 0 20px ${color}`, minWidth: 80 }}>
          {score}
          <div style={{ fontSize: 11, color: '#888', fontWeight: 400, letterSpacing: 3 }}>/ 100</div>
        </div>
      </Html>
    </>
  )
}

export function ScoreDial({ score }: { score: number }) {
  return (
    <div style={{ width: '100%', height: 280 }}>
      <Canvas camera={{ position: [0, 0, 3.5], fov: 45 }} dpr={[1, 2]} frameloop="always">
        <DialScene score={score} />
      </Canvas>
    </div>
  )
}
