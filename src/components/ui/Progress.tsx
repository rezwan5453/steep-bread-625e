import React from 'react'

interface ProgressProps {
  value: number
  max?: number
  label?: string
  color?: 'gold' | 'green' | 'red'
  showValue?: boolean
}

export function Progress({ value, max = 100, label, color = 'gold', showValue }: ProgressProps) {
  const pct = Math.min(100, Math.round((value / max) * 100))

  const colors = {
    gold: 'bg-[#c8a84b]',
    green: 'bg-[#3a7d44]',
    red: 'bg-[#cc3333]',
  }

  return (
    <div className="w-full">
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-1">
          {label && <span className="text-xs font-mono text-[#888] uppercase tracking-wider">{label}</span>}
          {showValue && <span className="text-xs font-mono text-[#c8a84b]">{value}/{max}</span>}
        </div>
      )}
      <div className="w-full h-1.5 bg-[#1a1a1a] overflow-hidden">
        <div
          className={`h-full transition-all duration-700 ease-out ${colors[color]}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
