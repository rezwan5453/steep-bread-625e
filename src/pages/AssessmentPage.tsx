import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Save, Shield } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Progress } from '../components/ui/Progress'
import { RadarScanner } from '../components/3d/RadarScanner'
import { SECTIONS } from '../lib/questions'
import { calculateScores, estimatedSurvivalDays } from '../lib/scoring'
import { generateSurvivalPlan } from '../lib/survivalPlan'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import type { Question, UserResponse } from '../types'

type AnswerValue = string | string[] | number | boolean

function QuestionRenderer({
  question,
  value,
  onChange,
}: {
  question: Question
  value: AnswerValue | undefined
  onChange: (v: AnswerValue) => void
}) {
  if (question.type === 'yesno') {
    return (
      <div className="flex gap-4">
        {['yes', 'no'].map(opt => (
          <button
            key={opt}
            onClick={() => onChange(opt === 'yes')}
            className={`flex-1 py-4 font-mono font-bold uppercase tracking-widest text-sm border transition-all ${
              value === (opt === 'yes')
                ? opt === 'yes'
                  ? 'bg-[#3a7d44]/20 border-[#3a7d44] text-[#3a7d44]'
                  : 'bg-[#cc3333]/20 border-[#cc3333] text-[#cc3333]'
                : 'bg-transparent border-[#2a2a2a] text-[#666] hover:border-[#c8a84b] hover:text-[#c8a84b]'
            }`}
          >
            {opt === 'yes' ? '✓ YES' : '✗ NO'}
          </button>
        ))}
      </div>
    )
  }

  if (question.type === 'single') {
    return (
      <div className="space-y-2">
        {question.options?.map(opt => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`w-full text-left px-4 py-3 font-mono text-sm border transition-all ${
              value === opt
                ? 'bg-[#c8a84b]/10 border-[#c8a84b] text-[#c8a84b]'
                : 'bg-[#0f0f0f] border-[#2a2a2a] text-[#888] hover:border-[#c8a84b]/50 hover:text-[#e8e8e8]'
            }`}
          >
            <span className="text-[#555] mr-3">▸</span>
            {opt}
          </button>
        ))}
      </div>
    )
  }

  if (question.type === 'multi') {
    const selected = Array.isArray(value) ? (value as string[]) : []
    function toggle(opt: string) {
      if (selected.includes(opt)) {
        onChange(selected.filter(s => s !== opt))
      } else {
        onChange([...selected, opt])
      }
    }
    return (
      <div className="space-y-2">
        <p className="font-mono text-xs text-[#555] mb-2 uppercase tracking-wider">Select all that apply</p>
        {question.options?.map(opt => (
          <button
            key={opt}
            onClick={() => toggle(opt)}
            className={`w-full text-left px-4 py-3 font-mono text-sm border transition-all ${
              selected.includes(opt)
                ? 'bg-[#c8a84b]/10 border-[#c8a84b] text-[#c8a84b]'
                : 'bg-[#0f0f0f] border-[#2a2a2a] text-[#888] hover:border-[#c8a84b]/50 hover:text-[#e8e8e8]'
            }`}
          >
            <span className="mr-3">{selected.includes(opt) ? '☑' : '☐'}</span>
            {opt}
          </button>
        ))}
      </div>
    )
  }

  if (question.type === 'number') {
    return (
      <Input
        type="number"
        value={value !== undefined ? String(value) : ''}
        onChange={e => onChange(e.target.value === '' ? 0 : Number(e.target.value))}
        placeholder={question.placeholder}
        suffix={question.unit}
        min={question.min}
        max={question.max}
        className="text-lg text-center"
      />
    )
  }

  return (
    <Input
      type="text"
      value={typeof value === 'string' ? value : ''}
      onChange={e => onChange(e.target.value)}
      placeholder={question.placeholder || 'Type your answer...'}
    />
  )
}

export function AssessmentPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({})
  const [sectionIdx, setSectionIdx] = useState(0)
  const [questionIdx, setQuestionIdx] = useState(0)
  const [saving, setSaving] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [animating, setAnimating] = useState(false)
  const animDir = useRef<'forward' | 'back'>('forward')
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const totalQuestions = SECTIONS.reduce((acc, s) => acc + s.questions.length, 0)
  const answeredCount = Object.keys(answers).length
  const globalProgress = Math.round((answeredCount / totalQuestions) * 100)

  // Load existing answers
  useEffect(() => {
    if (!user) return
    supabase
      .from('user_responses')
      .select('*')
      .eq('user_id', user.id)
      .then(({ data }) => {
        if (data && data.length > 0) {
          const map: Record<string, AnswerValue> = {}
          data.forEach((r: UserResponse) => { map[r.question_id] = r.answer as AnswerValue })
          setAnswers(map)
          // Resume from last answered section
          let lastSec = 0, lastQ = 0
          outer: for (let si = 0; si < SECTIONS.length; si++) {
            for (let qi = 0; qi < SECTIONS[si].questions.length; qi++) {
              if (map[SECTIONS[si].questions[qi].id] === undefined) {
                lastSec = si; lastQ = qi; break outer
              }
              lastSec = si; lastQ = qi
            }
          }
          setSectionIdx(lastSec)
          setQuestionIdx(Math.min(lastQ, SECTIONS[lastSec].questions.length - 1))
        }
      })
  }, [user])

  const saveAnswer = useCallback(async (questionId: string, sectionId: string, answer: AnswerValue) => {
    if (!user) return
    setSaving(true)
    await supabase.from('user_responses').upsert({
      user_id: user.id,
      section_id: sectionId,
      question_id: questionId,
      answer: JSON.stringify(answer),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,question_id' })
    setSaving(false)
  }, [user])

  function handleAnswer(val: AnswerValue) {
    const section = SECTIONS[sectionIdx]
    const question = section.questions[questionIdx]
    const newAnswers = { ...answers, [question.id]: val }
    setAnswers(newAnswers)
    if (saveTimeout.current) clearTimeout(saveTimeout.current)
    saveTimeout.current = setTimeout(() => {
      saveAnswer(question.id, section.id, val)
    }, 500)
  }

  function navigate_q(dir: 'next' | 'prev') {
    animDir.current = dir === 'next' ? 'forward' : 'back'
    setAnimating(true)
    setTimeout(() => {
      if (dir === 'next') {
        const section = SECTIONS[sectionIdx]
        if (questionIdx < section.questions.length - 1) {
          setQuestionIdx(questionIdx + 1)
        } else if (sectionIdx < SECTIONS.length - 1) {
          setSectionIdx(sectionIdx + 1)
          setQuestionIdx(0)
        }
      } else {
        if (questionIdx > 0) {
          setQuestionIdx(questionIdx - 1)
        } else if (sectionIdx > 0) {
          setSectionIdx(sectionIdx - 1)
          setQuestionIdx(SECTIONS[sectionIdx - 1].questions.length - 1)
        }
      }
      setAnimating(false)
    }, 350)
  }

  const isLast = sectionIdx === SECTIONS.length - 1 &&
    questionIdx === SECTIONS[SECTIONS.length - 1].questions.length - 1

  async function handleComplete() {
    if (!user) return
    setSubmitting(true)
    try {
      // Fetch all answers fresh
      const { data: responseData } = await supabase
        .from('user_responses')
        .select('*')
        .eq('user_id', user.id)

      const responses: UserResponse[] = (responseData || []).map((r: Record<string, unknown>) => ({
        user_id: r.user_id as string,
        section_id: r.section_id as string,
        question_id: r.question_id as string,
        answer: (() => {
          try { return JSON.parse(r.answer as string) } catch { return r.answer }
        })()
      }))

      // Get profile for country
      const { data: profile } = await supabase
        .from('profiles')
        .select('country')
        .eq('id', user.id)
        .single()

      const scores = calculateScores(responses)
      const overall = Object.values(scores).reduce((a, b) => a + b, 0)
      const survivalDays = estimatedSurvivalDays(responses)
      const planText = generateSurvivalPlan(scores, responses, profile?.country || 'Unknown')

      await supabase.from('survival_plans').upsert({
        user_id: user.id,
        overall_score: overall,
        scores: JSON.stringify(scores),
        plan_text: planText,
        estimated_survival_days: survivalDays,
        created_at: new Date().toISOString(),
      }, { onConflict: 'user_id' })

      await supabase.from('profiles').update({
        assessment_completed: true,
        overall_score: overall,
        updated_at: new Date().toISOString(),
      }).eq('id', user.id)

      navigate('/dashboard')
    } catch (err) {
      console.error(err)
      setSubmitting(false)
    }
  }

  const section = SECTIONS[sectionIdx]
  const question = section.questions[questionIdx]
  const currentAnswer = answers[question.id]

  // Overall question number
  let globalQ = 0
  for (let si = 0; si < sectionIdx; si++) globalQ += SECTIONS[si].questions.length
  globalQ += questionIdx + 1

  return (
    <div className="relative min-h-screen bg-[#0a0a0a] overflow-hidden">
      <React.Suspense fallback={null}>
        <RadarScanner />
      </React.Suspense>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-[#1a1a1a] bg-[#0a0a0a]/90 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Shield className="text-[#c8a84b]" size={18} />
          <span className="font-mono text-xs font-bold tracking-widest uppercase text-[#888]">
            READINESS ASSESSMENT
          </span>
        </div>
        <div className="flex items-center gap-4">
          {saving && (
            <span className="font-mono text-xs text-[#555] uppercase tracking-wider animate-pulse">
              SAVING...
            </span>
          )}
          <button
            onClick={() => navigate('/dashboard')}
            className="font-mono text-xs text-[#555] hover:text-[#c8a84b] transition-colors uppercase tracking-wider"
          >
            SAVE & EXIT
          </button>
        </div>
      </header>

      {/* Progress */}
      <div className="relative z-10 px-6 py-3 border-b border-[#1a1a1a] bg-[#0a0a0a]/80">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-xs text-[#c8a84b] uppercase tracking-widest">
              SECTION {sectionIdx + 1} OF {SECTIONS.length} — {section.title.toUpperCase()}
            </span>
            <span className="font-mono text-xs text-[#555]">
              Q{globalQ}/{totalQuestions}
            </span>
          </div>
          <Progress value={globalProgress} max={100} color="gold" />
        </div>
      </div>

      {/* Question */}
      <main className="relative z-10 flex items-center justify-center min-h-[calc(100vh-130px)] px-4">
        <div className="w-full max-w-2xl">
          <div
            className={animating ? (animDir.current === 'forward' ? 'question-exit' : 'question-enter') : 'question-enter'}
            key={`${sectionIdx}-${questionIdx}`}
          >
            {/* Section badge */}
            <div className="mb-4 flex items-center gap-3">
              <span className="font-mono text-xs text-[#555] uppercase tracking-widest">
                {section.title}
              </span>
              <div className="flex-1 h-px bg-[#1a1a1a]" />
              <span className="font-mono text-xs text-[#555]">
                {questionIdx + 1}/{section.questions.length}
              </span>
            </div>

            {/* Question text */}
            <h2 className="font-mono text-xl font-bold text-[#e8e8e8] mb-6 leading-snug">
              {question.text}
            </h2>

            {/* Answer area */}
            <div className="mb-8">
              <QuestionRenderer
                question={question}
                value={currentAnswer}
                onChange={handleAnswer}
              />
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate_q('prev')}
                disabled={sectionIdx === 0 && questionIdx === 0}
                className="gap-2"
              >
                <ChevronLeft size={16} />
                BACK
              </Button>

              {isLast ? (
                <Button
                  variant="primary"
                  size="lg"
                  loading={submitting}
                  onClick={handleComplete}
                >
                  COMPLETE ASSESSMENT
                  <ChevronRight size={16} />
                </Button>
              ) : (
                <Button
                  variant={currentAnswer !== undefined ? 'primary' : 'ghost'}
                  onClick={() => navigate_q('next')}
                  className="gap-2"
                >
                  {currentAnswer !== undefined ? 'NEXT' : 'SKIP'}
                  <ChevronRight size={16} />
                </Button>
              )}
            </div>

            {isLast && (
              <p className="font-mono text-xs text-[#555] text-center mt-3">
                Answering all questions improves your survival plan accuracy
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
