import React from 'react'
import { clsx } from 'clsx'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'success'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

export function Button({ variant = 'primary', size = 'md', loading, className, children, disabled, ...props }: ButtonProps) {
  const base = 'inline-flex items-center justify-center gap-2 font-mono font-semibold uppercase tracking-widest transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed border'

  const variants = {
    primary: 'bg-[#c8a84b] text-black border-[#c8a84b] hover:bg-[#d4b85e] focus:ring-[#c8a84b]',
    secondary: 'bg-transparent text-[#c8a84b] border-[#c8a84b] hover:bg-[#c8a84b]/10 focus:ring-[#c8a84b]',
    danger: 'bg-[#cc3333] text-white border-[#cc3333] hover:bg-[#dd4444] focus:ring-[#cc3333]',
    ghost: 'bg-transparent text-[#e8e8e8] border-[#2a2a2a] hover:border-[#c8a84b] hover:text-[#c8a84b] focus:ring-[#c8a84b]',
    success: 'bg-[#3a7d44] text-white border-[#3a7d44] hover:bg-[#4a8d54] focus:ring-[#3a7d44]',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-8 py-3.5 text-base',
  }

  return (
    <button
      className={clsx(base, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  )
}
