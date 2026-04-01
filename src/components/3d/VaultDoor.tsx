import React, { useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { useSpring, animated } from '@react-spring/three'

function VaultScene({ open }: { open: boolean }) {
  const { rotY } = useSpring({
    rotY: open ? -Math.PI / 1.8 : 0,
    config: { mass: 2, tension: 40, friction: 20 },
  })
  const { scale } = useSpring({
    scale: open ? 0.8 : 1,
    config: { mass: 1, tension: 60, friction: 18 },
  })

  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[3, 3, 3]} intensity={1.5} color="#c8a84b" />
      <pointLight position={[-3, -2, 2]} intensity={0.5} color="#4466aa" />
      {/* Vault door */}
      <animated.group rotation-y={rotY}>
        <mesh>
          <cylinderGeometry args={[1.4, 1.4, 0.3, 32]} />
          <meshStandardMaterial color="#1a1a1a" metalness={0.9} roughness={0.2} />
        </mesh>
        {/* Bolt rings */}
        {[0, Math.PI / 3, (2 * Math.PI) / 3, Math.PI, (4 * Math.PI) / 3, (5 * Math.PI) / 3].map((a, i) => (
          <mesh key={i} position={[Math.cos(a) * 1.1, 0, Math.sin(a) * 1.1]}>
            <cylinderGeometry args={[0.1, 0.1, 0.35, 12]} />
            <meshStandardMaterial color="#c8a84b" metalness={1} roughness={0.1} />
          </mesh>
        ))}
        {/* Center disc */}
        <mesh position={[0, 0.16, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 0.05, 32]} />
          <meshStandardMaterial color="#c8a84b" metalness={1} roughness={0.1} emissive="#c8a84b" emissiveIntensity={0.3} />
        </mesh>
      </animated.group>
      {/* Spinning torus ring */}
      <animated.mesh rotation-z={rotY} scale={scale}>
        <torusGeometry args={[1.7, 0.06, 16, 64]} />
        <meshStandardMaterial color="#c8a84b" metalness={1} roughness={0.1} emissive="#c8a84b" emissiveIntensity={0.2} />
      </animated.mesh>
    </>
  )
}

interface VaultDoorProps {
  onComplete?: () => void
}

export function VaultDoor({ onComplete }: VaultDoorProps) {
  const [open, setOpen] = useState(false)
  const [visible, setVisible] = useState(true)
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

  useEffect(() => {
    const t1 = setTimeout(() => setOpen(true), 800)
    const t2 = setTimeout(() => {
      setVisible(false)
      onComplete?.()
    }, 3500)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [onComplete])

  if (!visible) return null

  if (isMobile) {
    return (
      <div className="fixed inset-0 z-50 bg-[#0a0a0a] flex items-center justify-center" style={{ animation: 'fadeOut 0.5s 3s forwards' }}>
        <div className="text-center">
          <div className="text-[#c8a84b] font-mono uppercase tracking-widest text-sm animate-pulse">
            ACCESSING YOUR SURVIVAL PROFILE...
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#0a0a0a] flex flex-col items-center justify-center">
      <div style={{ width: 320, height: 320 }}>
        <Canvas camera={{ position: [0, 0, 4], fov: 45 }} dpr={[1, 2]}>
          <VaultScene open={open} />
        </Canvas>
      </div>
      <div className="mt-6 text-[#c8a84b] font-mono uppercase tracking-widest text-sm animate-pulse">
        ACCESSING YOUR SURVIVAL PROFILE...
      </div>
      <div className="mt-2 text-[#555] font-mono text-xs">
        {open ? 'CLEARANCE GRANTED' : 'VERIFYING CREDENTIALS...'}
      </div>
    </div>
  )
}
