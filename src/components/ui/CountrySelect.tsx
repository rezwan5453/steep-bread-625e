import React, { useState, useRef, useEffect } from 'react'
import { COUNTRIES } from '../../lib/countries'
import { clsx } from 'clsx'

interface CountrySelectProps {
  value: string
  onChange: (country: string) => void
  error?: string
}

export function CountrySelect({ value, onChange, error }: CountrySelectProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  const filtered = COUNTRIES.filter(c => c.toLowerCase().includes(search.toLowerCase()))

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="w-full relative" ref={ref}>
      <label className="block text-xs font-mono uppercase tracking-widest text-[#c8a84b] mb-1.5">
        Country
      </label>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={clsx(
          'w-full text-left bg-[#0f0f0f] border font-mono text-sm px-3 py-2.5 focus:outline-none focus:ring-1 transition-colors',
          error ? 'border-[#cc3333] focus:ring-[#cc3333]' : 'border-[#2a2a2a] focus:border-[#c8a84b] focus:ring-[#c8a84b]',
          value ? 'text-[#e8e8e8]' : 'text-[#444]'
        )}
      >
        {value || 'Select your country...'}
      </button>
      {open && (
        <div className="absolute z-50 w-full bg-[#111] border border-[#2a2a2a] mt-1 shadow-xl">
          <div className="p-2 border-b border-[#2a2a2a]">
            <input
              autoFocus
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search countries..."
              className="w-full bg-[#0a0a0a] border border-[#2a2a2a] text-[#e8e8e8] font-mono text-sm px-3 py-2 focus:outline-none focus:border-[#c8a84b] placeholder:text-[#444]"
            />
          </div>
          <div className="max-h-52 overflow-y-auto">
            {filtered.map(country => (
              <button
                key={country}
                type="button"
                onClick={() => { onChange(country); setOpen(false); setSearch('') }}
                className={clsx(
                  'w-full text-left px-3 py-2 text-sm font-mono hover:bg-[#1a1a1a] transition-colors',
                  country === value ? 'text-[#c8a84b] bg-[#1a1a1a]' : 'text-[#e8e8e8]'
                )}
              >
                {country}
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="px-3 py-4 text-sm text-[#555] font-mono text-center">No countries found</div>
            )}
          </div>
        </div>
      )}
      {error && <p className="mt-1 text-xs text-[#cc3333] font-mono">{error}</p>}
    </div>
  )
}
