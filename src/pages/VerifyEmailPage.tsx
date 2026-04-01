import React from 'react'
import { Link } from 'react-router-dom'
import { Mail, Shield } from 'lucide-react'

export function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="max-w-md text-center">
        <Shield className="text-[#c8a84b] mx-auto mb-4" size={40} />
        <h1 className="font-mono text-2xl font-black uppercase tracking-widest text-[#e8e8e8] mb-4">
          VERIFY EMAIL
        </h1>
        <div className="bg-[#111] border border-[#2a2a2a] p-8 mb-6">
          <Mail className="text-[#c8a84b] mx-auto mb-4" size={48} />
          <p className="font-mono text-sm text-[#888] leading-relaxed mb-3">
            A verification link has been dispatched to your email address.
          </p>
          <p className="font-mono text-xs text-[#555] leading-relaxed">
            Click the link in the email to activate your account and proceed to the assessment.
            Check your spam folder if you don't see it within 2 minutes.
          </p>
        </div>
        <div className="flex items-center justify-center gap-2 mb-6">
          <span className="w-2 h-2 bg-[#c8a84b] rounded-full animate-pulse" />
          <span className="font-mono text-xs text-[#555] uppercase tracking-widest">
            AWAITING CONFIRMATION
          </span>
        </div>
        <Link to="/login" className="font-mono text-xs text-[#c8a84b] hover:underline uppercase tracking-wider">
          ALREADY VERIFIED? SIGN IN →
        </Link>
      </div>
    </div>
  )
}
