import React, { useRef, useMemo, useCallback } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

function isMobile() {
  return typeof window !== 'undefined' && window.innerWidth < 768
}

function Particles({ mouse }: { mouse: React.MutableRefObject<[number, number]> }) {
  const mesh = useRef<THREE.Points>(null)
  const count = isMobile() ? 600 : 2000

  const { positions, velocities } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const velocities = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20
      positions[i * 3 + 2] = (Math.random() - 0.5) * 5
      velocities[i] = 0.002 + Math.random() * 0.004
    }
    return { positions, velocities }
  }, [count])

  useFrame(() => {
    if (!mesh.current) return
    const pos = mesh.current.geometry.attributes.position.array as Float32Array
    const [mx, my] = mouse.current
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 1] += velocities[i]
      pos[i * 3] += (mx * 0.001)
      if (pos[i * 3 + 1] > 10) {
        pos[i * 3 + 1] = -10
        pos[i * 3] = (Math.random() - 0.5) * 20
      }
    }
    mesh.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        color="#c8a84b"
        transparent
        opacity={0.5}
        sizeAttenuation
      />
    </points>
  )
}

function Scene() {
  const mouse = useRef<[number, number]>([0, 0])
  const { gl } = useThree()

  const onMouseMove = useCallback((e: MouseEvent) => {
    mouse.current = [
      (e.clientX / window.innerWidth) * 2 - 1,
      -(e.clientY / window.innerHeight) * 2 + 1,
    ]
  }, [])

  React.useEffect(() => {
    gl.domElement.parentElement?.addEventListener('mousemove', onMouseMove)
    return () => gl.domElement.parentElement?.removeEventListener('mousemove', onMouseMove)
  }, [gl, onMouseMove])

  return <Particles mouse={mouse} />
}

export function ParticleField() {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
      <Canvas camera={{ position: [0, 0, 8], fov: 60 }} dpr={[1, 2]}>
        <Scene />
      </Canvas>
    </div>
  )
}
