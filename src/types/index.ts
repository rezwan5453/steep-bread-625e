export interface Profile {
  id: string
  full_name: string
  email: string
  country: string
  assessment_completed: boolean
  overall_score: number | null
  created_at: string
  updated_at: string
}

export interface UserResponse {
  id?: string
  user_id: string
  section_id: string
  question_id: string
  answer: string | string[] | number | boolean
  created_at?: string
  updated_at?: string
}

export interface SurvivalPlan {
  id?: string
  user_id: string
  overall_score: number
  scores: CategoryScores
  plan_text: string
  estimated_survival_days: number
  created_at?: string
}

export interface CategoryScores {
  water: number
  food: number
  energy: number
  shelter: number
  medical: number
  security: number
  skills: number
  communication: number
  mobility: number
  financial: number
}

export interface Question {
  id: string
  text: string
  type: 'text' | 'number' | 'single' | 'multi' | 'yesno'
  options?: string[]
  placeholder?: string
  unit?: string
  min?: number
  max?: number
}

export interface Section {
  id: string
  title: string
  description: string
  questions: Question[]
}

export interface AuthUser {
  id: string
  email: string | undefined
}
