import React, { useRef, useState } from 'react'

interface TiltCardProps {
  children: React.ReactNode
  className?: string
  maxTilt?: number
}

export function TiltCard({ children, className = '', maxTilt = 8 }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [style, setStyle] = useState<React.CSSProperties>({})

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!ref.current) return
    const { left, top, width, height } = ref.current.getBoundingClientRect()
    const x = (e.clientX - left) / width - 0.5
    const y = (e.clientY - top) / height - 0.5
    setStyle({
      transform: `perspective(800px) rotateX(${-y * maxTilt}deg) rotateY(${x * maxTilt}deg) scale(1.02)`,
      transition: 'transform 0.1s ease-out',
    })
  }

  function onMouseLeave() {
    setStyle({
      transform: 'perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)',
      transition: 'transform 0.4s ease-out',
    })
  }

  return (
    <div
      ref={ref}
      style={style}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className={`relative overflow-hidden ${className}`}
    >
      {children}
      {/* Glare */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, rgba(200,168,75,0.05) 0%, transparent 60%)',
          pointerEvents: 'none',
        }}
      />
    </div>
  )
}
