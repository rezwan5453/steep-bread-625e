import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Shield, ArrowLeft, RefreshCw } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { CountrySelect } from '../components/ui/CountrySelect'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import type { Profile } from '../types'

export function ProfilePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [fullName, setFullName] = useState('')
  const [country, setCountry] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) return
    supabase.from('profiles').select('*').eq('id', user.id).single().then(({ data }) => {
      if (data) {
        setProfile(data)
        setFullName(data.full_name || '')
        setCountry(data.country || '')
      }
      setLoading(false)
    })
  }, [user])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    setSaving(true)
    setError('')
    const { error } = await supabase.from('profiles').update({
      full_name: fullName,
      country,
      updated_at: new Date().toISOString(),
    }).eq('id', user.id)
    setSaving(false)
    if (error) { setError(error.message); return }
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#c8a84b] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <header className="border-b border-[#1a1a1a] px-6 py-4 flex items-center gap-4 bg-[#0a0a0a]">
        <Link to="/dashboard" className="text-[#555] hover:text-[#c8a84b] transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div className="flex items-center gap-2">
          <Shield className="text-[#c8a84b]" size={18} />
          <span className="font-mono text-sm font-bold tracking-widest uppercase text-[#e8e8e8]">
            OPERATOR PROFILE
          </span>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-10">
        <div className="bg-[#111] border border-[#2a2a2a] p-6">
          <h2 className="font-mono text-xs uppercase tracking-widest text-[#c8a84b] mb-6 pb-2 border-b border-[#2a2a2a]">
            PERSONAL DETAILS
          </h2>

          {error && (
            <div className="mb-4 p-3 border border-[#cc3333]/50 bg-[#cc3333]/10">
              <p className="font-mono text-xs text-[#cc3333]">{error}</p>
            </div>
          )}
          {saved && (
            <div className="mb-4 p-3 border border-[#3a7d44]/50 bg-[#3a7d44]/10">
              <p className="font-mono text-xs text-[#3a7d44]">Profile updated successfully.</p>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="John Smith"
            />
            <Input
              label="Email"
              type="email"
              value={user?.email || ''}
              disabled
              className="opacity-50 cursor-not-allowed"
            />
            <CountrySelect value={country} onChange={setCountry} />
            <Button type="submit" variant="primary" loading={saving} className="w-full mt-2">
              SAVE CHANGES
            </Button>
          </form>
        </div>

        <div className="mt-6 bg-[#111] border border-[#2a2a2a] p-6">
          <h2 className="font-mono text-xs uppercase tracking-widest text-[#c8a84b] mb-4 pb-2 border-b border-[#2a2a2a]">
            ASSESSMENT
          </h2>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-mono text-sm text-[#e8e8e8]">
                Status: {profile?.assessment_completed ? (
                  <span className="text-[#3a7d44]">COMPLETED</span>
                ) : (
                  <span className="text-[#cc3333]">INCOMPLETE</span>
                )}
              </p>
              {profile?.overall_score !== null && profile?.overall_score !== undefined && (
                <p className="font-mono text-xs text-[#555] mt-1">Score: {profile.overall_score}/100</p>
              )}
            </div>
            <Button variant="secondary" size="sm" onClick={() => navigate('/assessment')}>
              <RefreshCw size={14} />
              {profile?.assessment_completed ? 'RETAKE' : 'START'}
            </Button>
          </div>
          <p className="font-mono text-xs text-[#555]">
            Retaking the assessment will overwrite your current survival plan with updated answers.
          </p>
        </div>
      </div>
    </div>
  )
}
