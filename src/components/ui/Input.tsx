import React from 'react'
import { clsx } from 'clsx'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  suffix?: string
}

export function Input({ label, error, suffix, className, ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-mono uppercase tracking-widest text-[#c8a84b] mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          className={clsx(
            'w-full bg-[#0f0f0f] border text-[#e8e8e8] font-mono text-sm px-3 py-2.5 focus:outline-none focus:ring-1 transition-colors placeholder:text-[#444]',
            error ? 'border-[#cc3333] focus:border-[#cc3333] focus:ring-[#cc3333]' : 'border-[#2a2a2a] focus:border-[#c8a84b] focus:ring-[#c8a84b]',
            suffix ? 'pr-16' : '',
            className
          )}
          {...props}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#666] font-mono uppercase">
            {suffix}
          </span>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-[#cc3333] font-mono">{error}</p>}
    </div>
  )
}
