import React from 'react'
import { clsx } from 'clsx'

interface CardProps {
  children: React.ReactNode
  className?: string
  glow?: boolean
}

export function Card({ children, className, glow }: CardProps) {
  return (
    <div
      className={clsx(
        'bg-[#111111] border border-[#2a2a2a] p-5',
        glow && 'shadow-[0_0_20px_rgba(200,168,75,0.08)]',
        className
      )}
    >
      {children}
    </div>
  )
}
