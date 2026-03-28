import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Shield } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { supabase } from '../lib/supabase'

export function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')
  const [resetSent, setResetSent] = useState(false)
  const [showReset, setShowReset] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setApiError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setApiError(error.message)
    } else {
      navigate('/dashboard')
    }
    setLoading(false)
  }

  async function handleReset() {
    if (!email.includes('@')) { setApiError('Enter your email above first.'); return }
    setLoading(true)
    await supabase.auth.resetPasswordForEmail(email)
    setResetSent(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Shield className="text-[#c8a84b] mx-auto mb-3" size={32} />
          <h1 className="font-mono text-2xl font-black uppercase tracking-widest text-[#e8e8e8]">
            SECURE ACCESS
          </h1>
          <p className="font-mono text-xs text-[#555] mt-2 uppercase tracking-wider">
            SURVIVAL ASSESSMENT SYSTEM
          </p>
        </div>

        <div className="bg-[#111] border border-[#2a2a2a] p-6">
          {apiError && (
            <div className="mb-4 p-3 border border-[#cc3333]/50 bg-[#cc3333]/10">
              <p className="font-mono text-xs text-[#cc3333]">{apiError}</p>
            </div>
          )}
          {resetSent && (
            <div className="mb-4 p-3 border border-[#3a7d44]/50 bg-[#3a7d44]/10">
              <p className="font-mono text-xs text-[#3a7d44]">Password reset email sent.</p>
            </div>
          )}
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="operator@secure.net"
              autoComplete="email"
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
            />
            <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full mt-2">
              AUTHENTICATE
            </Button>
          </form>
          <div className="mt-4 flex items-center justify-between">
            <button
              type="button"
              onClick={handleReset}
              className="font-mono text-xs text-[#555] hover:text-[#c8a84b] transition-colors"
            >
              Forgot password?
            </button>
            <Link to="/register" className="font-mono text-xs text-[#c8a84b] hover:underline">
              Create account
            </Link>
          </div>
        </div>
        <p className="font-mono text-xs text-[#444] text-center mt-6 uppercase tracking-wider">
          <Link to="/" className="hover:text-[#c8a84b] transition-colors">← RETURN TO BASE</Link>
        </p>
      </div>
    </div>
  )
}
