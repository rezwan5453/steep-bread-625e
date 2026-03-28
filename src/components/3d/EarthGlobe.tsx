import React, { useRef } from 'react'
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { TextureLoader } from 'three'

const CONFLICT_ZONES = [
  { lat: 48.3794, lon: 31.1656 }, // Ukraine
  { lat: 33.8869, lon: 35.5131 }, // Lebanon
  { lat: 15.5527, lon: 32.5324 }, // Sudan
  { lat: 31.5, lon: 34.8 },       // Gaza
  { lat: 15.3694, lon: 44.191 },  // Yemen
  { lat: 33.93, lon: 67.71 },     // Afghanistan
]

function latLonToVec3(lat: number, lon: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lon + 180) * (Math.PI / 180)
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  )
}

function ConflictDot({ lat, lon }: { lat: number; lon: number }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const pos = latLonToVec3(lat, lon, 1.01)

  useFrame(({ clock }) => {
    if (meshRef.current) {
      const s = 1 + Math.sin(clock.getElapsedTime() * 3) * 0.4
      meshRef.current.scale.setScalar(s)
    }
  })

  return (
    <mesh ref={meshRef} position={pos}>
      <sphereGeometry args={[0.015, 8, 8]} />
      <meshBasicMaterial color="#cc3333" />
    </mesh>
  )
}

function Globe() {
  const meshRef = useRef<THREE.Mesh>(null)
  let texture: THREE.Texture | undefined
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    texture = useLoader(TextureLoader, 'https://unpkg.com/three-globe/example/img/earth-dark.jpg')
  } catch {
    texture = undefined
  }

  useFrame((_, delta) => {
    if (meshRef.current) meshRef.current.rotation.y += delta * 0.1
  })

  return (
    <>
      <mesh ref={meshRef}>
        <sphereGeometry args={[1, 64, 64]} />
        {texture ? (
          <meshStandardMaterial map={texture} />
        ) : (
          <meshStandardMaterial color="#1a2a3a" wireframe />
        )}
      </mesh>
      <mesh>
        <sphereGeometry args={[1.03, 32, 32]} />
        <meshStandardMaterial
          color="#4488ff"
          transparent
          opacity={0.05}
          side={THREE.FrontSide}
        />
      </mesh>
      {CONFLICT_ZONES.map((z, i) => (
        <ConflictDot key={i} lat={z.lat} lon={z.lon} />
      ))}
    </>
  )
}

export function EarthGlobe() {
  return (
    <Canvas camera={{ position: [0, 0, 2.8], fov: 45 }} dpr={[1, 2]}>
      <ambientLight intensity={0.3} />
      <pointLight position={[5, 3, 5]} intensity={1.5} color="#c8a84b" />
      <pointLight position={[-5, -3, -5]} intensity={0.3} color="#4488ff" />
      <React.Suspense fallback={null}>
        <Globe />
      </React.Suspense>
      <OrbitControls enableZoom={false} autoRotate={false} enableDamping dampingFactor={0.05} />
    </Canvas>
  )
}
