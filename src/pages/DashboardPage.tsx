import React, { useState, useEffect, Suspense } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Shield, Download, RefreshCw, ChevronDown, ChevronUp, AlertTriangle, CheckCircle, User } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Progress } from '../components/ui/Progress'
import { TiltCard } from '../components/TiltCard'
import { VaultDoor } from '../components/3d/VaultDoor'
import { ScoreDial } from '../components/3d/ScoreDial'
import { BunkerConstruction } from '../components/3d/BunkerConstruction'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { SCORE_LABELS, SCORE_MAX } from '../lib/scoring'
import type { CategoryScores, SurvivalPlan, Profile } from '../types'

interface PlanData {
  overall_score: number
  scores: CategoryScores
  plan_text: string
  estimated_survival_days: number
}

const SECTION_DESCRIPTIONS: Record<string, string> = {
  water: 'Clean water access and storage',
  food: 'Food reserves and production',
  energy: 'Power when the grid fails',
  shelter: 'Structural protection',
  medical: 'Healthcare and first aid',
  security: 'Defense and community',
  skills: 'Practical survival knowledge',
  communication: 'Info when networks fail',
  mobility: 'Evacuation capability',
  financial: 'Economic resilience',
}

function getScoreColor(score: number, max: number) {
  const pct = score / max
  if (pct >= 0.7) return '#3a7d44'
  if (pct >= 0.4) return '#c8a84b'
  return '#cc3333'
}

function getScoreLabel(score: number) {
  if (score >= 80) return { label: 'EXCELLENT', color: '#3a7d44' }
  if (score >= 60) return { label: 'GOOD', color: '#3a7d44' }
  if (score >= 40) return { label: 'MODERATE', color: '#c8a84b' }
  if (score >= 20) return { label: 'LOW', color: '#cc3333' }
  return { label: 'CRITICAL', color: '#cc3333' }
}

function UrgentActions({ planText }: { planText: string }) {
  const actions: string[] = []
  const lines = planText.split('\n')
  for (const line of lines) {
    if ((line.startsWith('CRITICAL:') || line.startsWith('WARNING:') || line.startsWith('ACTION:') || line.startsWith('PRIORITY')) && actions.length < 5) {
      actions.push(line.replace(/^(CRITICAL:|WARNING:|ACTION:|PRIORITY \d+:|PRIORITY:)\s*/i, '').trim())
    }
  }
  return (
    <div className="space-y-2">
      {actions.map((a, i) => (
        <div key={i} className="flex items-start gap-3 p-3 bg-[#0f0f0f] border border-[#2a2a2a]">
          <span className="text-[#cc3333] font-mono font-bold text-sm mt-0.5 shrink-0">{i + 1}.</span>
          <p className="font-mono text-sm text-[#e8e8e8]">{a}</p>
        </div>
      ))}
    </div>
  )
}

function PlanAccordion({ planText }: { planText: string }) {
  const [openSections, setOpenSections] = useState<Set<number>>(new Set([0]))

  const sections: { title: string; content: string }[] = []
  let current: { title: string; lines: string[] } | null = null

  for (const line of planText.split('\n')) {
    if (line.startsWith('SECTION ') || line.startsWith('COUNTRY-SPECIFIC') || line.startsWith('TOP 5')) {
      if (current) sections.push({ title: current.title, content: current.lines.join('\n') })
      current = { title: line, lines: [] }
    } else if (current) {
      current.lines.push(line)
    }
  }
  if (current) sections.push({ title: current.title, content: current.lines.join('\n') })

  function toggle(i: number) {
    setOpenSections(prev => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  }

  return (
    <div className="space-y-2">
      {sections.map((s, i) => (
        <div key={i} className="border border-[#2a2a2a]">
          <button
            onClick={() => toggle(i)}
            className="w-full flex items-center justify-between px-4 py-3 bg-[#111] hover:bg-[#161616] transition-colors"
          >
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#c8a84b] text-left">
              {s.title}
            </span>
            {openSections.has(i) ? <ChevronUp size={14} className="text-[#555]" /> : <ChevronDown size={14} className="text-[#555]" />}
          </button>
          {openSections.has(i) && (
            <div className="px-4 py-4 bg-[#0d0d0d] border-t border-[#2a2a2a]">
              <pre className="font-mono text-xs text-[#888] whitespace-pre-wrap leading-relaxed">
                {s.content}
              </pre>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export function DashboardPage() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [plan, setPlan] = useState<PlanData | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [vaultDone, setVaultDone] = useState(false)
  const [isFirstVisit, setIsFirstVisit] = useState(false)

  useEffect(() => {
    if (!user) return
    async function load() {
      const [{ data: p }, { data: pl }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user!.id).single(),
        supabase.from('survival_plans').select('*').eq('user_id', user!.id).single(),
      ])
      setProfile(p)
      if (pl) {
        try {
          setPlan({
            ...pl,
            scores: typeof pl.scores === 'string' ? JSON.parse(pl.scores) : pl.scores,
          })
        } catch { setPlan(pl) }
      } else if (p?.assessment_completed) {
        // Generate plan
        setGenerating(true)
      } else {
        // Not completed
      }
      // First visit if plan was just created (within last 10s)
      if (pl?.created_at) {
        const created = new Date(pl.created_at).getTime()
        setIsFirstVisit(Date.now() - created < 15000)
      }
      setLoading(false)
    }
    load()
  }, [user])

  function handleDownload() {
    if (!plan) return
    const blob = new Blob([plan.plan_text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'survival-plan.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#c8a84b] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (generating) {
    return <BunkerConstruction onComplete={() => { setGenerating(false); window.location.reload() }} />
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <AlertTriangle className="text-[#c8a84b] mx-auto mb-4" size={48} />
          <h2 className="font-mono text-xl font-bold uppercase tracking-widest text-[#e8e8e8] mb-3">
            NO ASSESSMENT DATA
          </h2>
          <p className="font-mono text-sm text-[#555] mb-6">
            Complete the readiness assessment to generate your personalized survival plan.
          </p>
          <Button variant="primary" onClick={() => navigate('/assessment')}>
            START ASSESSMENT
          </Button>
        </div>
      </div>
    )
  }

  const scoreInfo = getScoreLabel(plan.overall_score)
  const scoreEntries = Object.entries(plan.scores) as [string, number][]
  const sortedScores = [...scoreEntries].sort((a, b) => {
    const pA = a[1] / (SCORE_MAX[a[0]] || 10)
    const pB = b[1] / (SCORE_MAX[b[0]] || 10)
    return pA - pB
  })

  return (
    <>
      {isFirstVisit && !vaultDone && (
        <VaultDoor onComplete={() => setVaultDone(true)} />
      )}
      <div className="min-h-screen bg-[#0a0a0a]">
        {/* Header */}
        <header className="border-b border-[#1a1a1a] px-6 py-4 flex items-center justify-between bg-[#0a0a0a] sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <Shield className="text-[#c8a84b]" size={18} />
            <span className="font-mono text-sm font-bold tracking-widest uppercase text-[#e8e8e8]">
              SURVIVAL DASHBOARD
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/profile">
              <Button variant="ghost" size="sm">
                <User size={14} />
                PROFILE
              </Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={signOut}>SIGN OUT</Button>
          </div>
        </header>

        <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
          {/* Score Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#111] border border-[#2a2a2a] p-4">
              <h2 className="font-mono text-xs uppercase tracking-widest text-[#c8a84b] mb-2 pb-2 border-b border-[#2a2a2a]">
                OVERALL READINESS SCORE
              </h2>
              <Suspense fallback={
                <div className="h-64 flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-[#c8a84b] border-t-transparent rounded-full animate-spin" />
                </div>
              }>
                <ScoreDial score={plan.overall_score} />
              </Suspense>
            </div>

            <div className="bg-[#111] border border-[#2a2a2a] p-4 flex flex-col justify-between">
              <div>
                <h2 className="font-mono text-xs uppercase tracking-widest text-[#c8a84b] mb-4 pb-2 border-b border-[#2a2a2a]">
                  MISSION BRIEFING
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-[#555] uppercase tracking-wider">Status</span>
                    <span className="font-mono text-sm font-bold" style={{ color: scoreInfo.color }}>
                      {scoreInfo.label}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-[#555] uppercase tracking-wider">Score</span>
                    <span className="font-mono text-sm text-[#e8e8e8]">{plan.overall_score}/100</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-[#555] uppercase tracking-wider">Est. Survival</span>
                    <span className="font-mono text-sm font-bold text-[#cc3333]">
                      {plan.estimated_survival_days} DAYS
                    </span>
                  </div>
                  {profile && (
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-[#555] uppercase tracking-wider">Operator</span>
                      <span className="font-mono text-sm text-[#e8e8e8]">{profile.full_name}</span>
                    </div>
                  )}
                  {profile?.country && (
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-[#555] uppercase tracking-wider">Location</span>
                      <span className="font-mono text-sm text-[#e8e8e8]">{profile.country}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <Button variant="secondary" size="sm" onClick={handleDownload}>
                  <Download size={14} />
                  DOWNLOAD
                </Button>
                <Button variant="ghost" size="sm" onClick={() => navigate('/assessment')}>
                  <RefreshCw size={14} />
                  RETAKE
                </Button>
              </div>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="bg-[#111] border border-[#2a2a2a] p-5">
            <h2 className="font-mono text-xs uppercase tracking-widest text-[#c8a84b] mb-4 pb-2 border-b border-[#2a2a2a]">
              CATEGORY BREAKDOWN
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {sortedScores.map(([key, score]) => {
                const max = SCORE_MAX[key] || 10
                const color = getScoreColor(score, max)
                const pct = Math.round((score / max) * 100)
                return (
                  <TiltCard key={key} className="bg-[#0d0d0d] border border-[#2a2a2a] p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="font-mono text-xs font-bold uppercase tracking-wider text-[#e8e8e8]">
                          {SCORE_LABELS[key]}
                        </div>
                        <div className="font-mono text-xs text-[#555] mt-0.5">
                          {SECTION_DESCRIPTIONS[key]}
                        </div>
                      </div>
                      <span className="font-mono text-sm font-bold" style={{ color }}>
                        {pct}%
                      </span>
                    </div>
                    <Progress
                      value={score}
                      max={max}
                      color={pct >= 70 ? 'green' : pct >= 40 ? 'gold' : 'red'}
                    />
                    <div className="flex justify-between mt-1">
                      <span className="font-mono text-xs text-[#444]">0</span>
                      <span className="font-mono text-xs text-[#444]">{score}/{max}</span>
                    </div>
                  </TiltCard>
                )
              })}
            </div>
          </div>

          {/* Top 5 Urgent Actions */}
          <div className="bg-[#111] border border-[#2a2a2a] p-5">
            <h2 className="font-mono text-xs uppercase tracking-widest text-[#cc3333] mb-4 pb-2 border-b border-[#2a2a2a] flex items-center gap-2">
              <AlertTriangle size={14} />
              TOP 5 URGENT ACTIONS
            </h2>
            <UrgentActions planText={plan.plan_text} />
          </div>

          {/* Survival Plan Accordion */}
          <div className="bg-[#111] border border-[#2a2a2a] p-5">
            <h2 className="font-mono text-xs uppercase tracking-widest text-[#c8a84b] mb-4 pb-2 border-b border-[#2a2a2a] flex items-center gap-2">
              <CheckCircle size={14} />
              FULL SURVIVAL PLAN
            </h2>
            <PlanAccordion planText={plan.plan_text} />
          </div>

          {/* Bottom actions */}
          <div className="flex flex-wrap gap-3 justify-center pb-8">
            <Button variant="primary" size="lg" onClick={handleDownload}>
              <Download size={16} />
              DOWNLOAD PLAN AS .TXT
            </Button>
            <Button variant="secondary" size="lg" onClick={() => navigate('/assessment')}>
              <RefreshCw size={16} />
              RETAKE ASSESSMENT
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
