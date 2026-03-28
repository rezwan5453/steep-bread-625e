import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Shield } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { CountrySelect } from '../components/ui/CountrySelect'
import { supabase } from '../lib/supabase'

export function RegisterPage() {
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [country, setCountry] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [apiError, setApiError] = useState('')

  function validate() {
    const errs: Record<string, string> = {}
    if (!fullName.trim()) errs.fullName = 'Full name required'
    if (!email.includes('@')) errs.email = 'Valid email required'
    if (password.length < 6) errs.password = 'Password must be 6+ characters'
    if (!country) errs.country = 'Country required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    setApiError('')
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName, country } },
      })
      if (error) { setApiError(error.message); return }
      if (data.user) {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          full_name: fullName,
          email,
          country,
          assessment_completed: false,
          overall_score: null,
        })
        navigate('/verify-email')
      }
    } catch (err) {
      setApiError('An unexpected error occurred.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Shield className="text-[#c8a84b] mx-auto mb-3" size={32} />
          <h1 className="font-mono text-2xl font-black uppercase tracking-widest text-[#e8e8e8]">
            CREATE ACCOUNT
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
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="John Smith"
              error={errors.fullName}
              autoComplete="name"
            />
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="operator@secure.net"
              error={errors.email}
              autoComplete="email"
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              error={errors.password}
              autoComplete="new-password"
            />
            <CountrySelect value={country} onChange={setCountry} error={errors.country} />
            <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full mt-2">
              INITIALIZE PROFILE
            </Button>
          </form>
          <p className="font-mono text-xs text-[#555] text-center mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-[#c8a84b] hover:underline">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
