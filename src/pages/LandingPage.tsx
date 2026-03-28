import React, { Suspense } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, Radio, MapPin, ChevronRight, AlertTriangle, Zap, Users } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { ParticleField } from '../components/3d/ParticleField'
import { EarthGlobe } from '../components/3d/EarthGlobe'

const FEATURES = [
  {
    icon: Shield,
    title: 'COMPREHENSIVE ASSESSMENT',
    desc: '12 critical survival categories evaluated across 60+ data points to map your true readiness.',
  },
  {
    icon: Radio,
    title: 'PERSONALIZED INTEL',
    desc: 'Your unique survival plan accounts for your location, resources, skills, and household size.',
  },
  {
    icon: MapPin,
    title: 'ACTIONABLE DIRECTIVES',
    desc: 'No vague advice. Specific, prioritized actions you can execute this week to close critical gaps.',
  },
]

export function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="relative min-h-screen bg-[#0a0a0a] overflow-x-hidden">
      <Suspense fallback={null}>
        <ParticleField />
      </Suspense>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-[#1a1a1a]">
        <div className="flex items-center gap-2">
          <Shield className="text-[#c8a84b]" size={20} />
          <span className="font-mono text-sm font-bold tracking-widest uppercase text-[#e8e8e8]">IWSWW3</span>
        </div>
        <div className="flex gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>Login</Button>
          <Button variant="primary" size="sm" onClick={() => navigate('/register')}>Get Started</Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-[#cc3333]/10 border border-[#cc3333]/30 px-3 py-1.5 mb-6">
              <AlertTriangle className="text-[#cc3333]" size={14} />
              <span className="font-mono text-xs uppercase tracking-widest text-[#cc3333]">
                THREAT LEVEL: ELEVATED
              </span>
            </div>

            <h1 className="font-mono text-4xl md:text-5xl lg:text-6xl font-black uppercase leading-none mb-6">
              <span className="text-[#e8e8e8]">I WILL</span>
              <br />
              <span className="text-[#c8a84b]">SURVIVE</span>
              <br />
              <span className="text-[#e8e8e8]">WORLD WAR</span>
              <br />
              <span className="text-[#cc3333]">THREE</span>
            </h1>

            <p className="font-mono text-sm text-[#888] leading-relaxed mb-8 max-w-lg">
              In 15 minutes, assess your actual survival readiness across water, food, energy,
              shelter, medical, security, and 6 more critical categories. Get a personalized
              tactical plan — no fluff, just what you need to survive.
            </p>

            <div className="flex flex-wrap gap-3">
              <Button variant="primary" size="lg" onClick={() => navigate('/register')}>
                <Zap size={16} />
                ASSESS MY READINESS
              </Button>
              <Button variant="secondary" size="lg" onClick={() => navigate('/login')}>
                <ChevronRight size={16} />
                VIEW MY PLAN
              </Button>
            </div>

            <div className="mt-8 flex items-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-mono font-bold text-[#c8a84b]">12</div>
                <div className="text-xs font-mono text-[#555] uppercase tracking-wider">Categories</div>
              </div>
              <div className="w-px h-10 bg-[#2a2a2a]" />
              <div className="text-center">
                <div className="text-2xl font-mono font-bold text-[#c8a84b]">60+</div>
                <div className="text-xs font-mono text-[#555] uppercase tracking-wider">Data Points</div>
              </div>
              <div className="w-px h-10 bg-[#2a2a2a]" />
              <div className="text-center">
                <div className="text-2xl font-mono font-bold text-[#c8a84b]">15min</div>
                <div className="text-xs font-mono text-[#555] uppercase tracking-wider">Assessment</div>
              </div>
            </div>
          </div>

          {/* Globe */}
          <div className="relative hidden lg:block h-[480px]">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-full h-full">
                <Suspense fallback={
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-[#c8a84b] border-t-transparent rounded-full animate-spin" />
                  </div>
                }>
                  <EarthGlobe />
                </Suspense>
              </div>
            </div>
            <div className="absolute top-4 right-4 bg-[#0a0a0a]/80 border border-[#cc3333]/50 px-3 py-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#cc3333] animate-pulse" />
                <span className="font-mono text-xs text-[#cc3333] uppercase">6 ACTIVE CONFLICTS</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-16 border-t border-[#1a1a1a]">
        <div className="text-center mb-12">
          <h2 className="font-mono text-2xl font-bold uppercase tracking-widest text-[#e8e8e8] mb-2">
            WHY PREPARE NOW
          </h2>
          <div className="w-16 h-px bg-[#c8a84b] mx-auto" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <div key={i} className="bg-[#111] border border-[#2a2a2a] p-6 hover:border-[#c8a84b]/40 transition-colors">
              <f.icon className="text-[#c8a84b] mb-4" size={28} />
              <h3 className="font-mono text-sm font-bold uppercase tracking-widest text-[#e8e8e8] mb-3">
                {f.title}
              </h3>
              <p className="font-mono text-xs text-[#666] leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-16 border-t border-[#1a1a1a]">
        <div className="bg-[#111] border border-[#c8a84b]/30 p-10 text-center">
          <Users className="text-[#c8a84b] mx-auto mb-4" size={36} />
          <h2 className="font-mono text-2xl font-bold uppercase tracking-widest text-[#e8e8e8] mb-3">
            KNOW YOUR SURVIVAL ODDS
          </h2>
          <p className="font-mono text-sm text-[#666] mb-6 max-w-lg mx-auto">
            Most people believe they're more prepared than they are. The assessment reveals
            your true readiness — and exactly what to do about it.
          </p>
          <Button variant="primary" size="lg" onClick={() => navigate('/register')}>
            START FREE ASSESSMENT
            <ChevronRight size={16} />
          </Button>
        </div>
      </section>

      <footer className="relative z-10 border-t border-[#1a1a1a] px-6 py-6 text-center">
        <p className="font-mono text-xs text-[#444] uppercase tracking-widest">
          I WILL SURVIVE WORLD WAR THREE — OPERATIONAL READINESS PLATFORM
        </p>
      </footer>
    </div>
  )
}
