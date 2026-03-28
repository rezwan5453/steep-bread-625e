import type { CategoryScores, UserResponse } from '../types'

type ResponseMap = Record<string, string | string[] | number | boolean>

function buildMap(responses: UserResponse[]): ResponseMap {
  const map: ResponseMap = {}
  for (const r of responses) {
    map[r.question_id] = r.answer
  }
  return map
}

function yn(val: unknown): number {
  if (val === true || val === 'true' || val === 'yes') return 1
  return 0
}

function num(val: unknown, fallback = 0): number {
  const n = Number(val)
  return isNaN(n) ? fallback : n
}

function hasAny(val: unknown, options: string[]): boolean {
  if (Array.isArray(val)) return val.some(v => options.includes(v))
  if (typeof val === 'string') return options.includes(val)
  return false
}

function multiCount(val: unknown): number {
  if (Array.isArray(val)) return val.filter(v => v !== 'None' && v !== 'None of these').length
  return 0
}

export function calculateScores(responses: UserResponse[]): CategoryScores {
  const m = buildMap(responses)

  // Water (0-15)
  const storedLiters = num(m.water_stored_liters)
  const members = Math.max(1, num(m.medical_household_members, 1))
  const waterDays = storedLiters / (members * 3)
  let water = 0
  water += Math.min(5, waterDays / 6) // up to 5pts for 30+ days
  water += yn(m.water_backup_source) * 3
  water += yn(m.water_filter) * 3
  water += yn(m.water_rainfall_catchment) * 2
  const filterTypes = multiCount(m.water_filter_type)
  water += Math.min(2, filterTypes)
  water = Math.min(15, Math.round(water))

  // Food (0-15)
  const foodDays = num(m.food_days_stored)
  let food = 0
  food += Math.min(6, foodDays / 15) // up to 6pts for 90+ days
  food += yn(m.food_preservation) * 2
  food += yn(m.food_farming) * 3
  food += yn(m.food_seeds) * 2
  food += Math.min(2, multiCount(m.food_hunting_fishing))
  food = Math.min(15, Math.round(food))

  // Energy (0-10)
  let energy = 0
  energy += yn(m.energy_solar) * 3
  energy += yn(m.energy_generator) * 2
  const fuelDays = num(m.energy_fuel_stored)
  energy += Math.min(2, fuelDays / 15)
  energy += yn(m.energy_firewood) * 2
  const genTypes = multiCount(m.energy_generator_type)
  energy += Math.min(1, genTypes > 1 ? 1 : 0)
  energy = Math.min(10, Math.round(energy))

  // Shelter (0-10)
  let shelter = 0
  const shelterType = m.shelter_type as string
  if (shelterType === 'Rural farmhouse' || shelterType === 'Underground/bunker') shelter += 4
  else if (shelterType === 'Detached house') shelter += 3
  else if (shelterType === 'Townhouse/terraced') shelter += 2
  else shelter += 1
  shelter += yn(m.shelter_insulation) * 2
  shelter += yn(m.shelter_sealed) * 2
  shelter += yn(m.shelter_basement) * 2
  shelter = Math.min(10, Math.round(shelter))

  // Medical (0-15)
  let medical = 0
  const kitLevel = ['None','Basic (bandages only)','Standard kit','Advanced kit (tourniquets, Israeli bandage, etc.)','Trauma kit (surgical instruments, etc.)']
  const kitIdx = kitLevel.indexOf(m.medical_first_aid as string)
  medical += Math.max(0, kitIdx) * 2 // up to 8
  const trainCount = multiCount(m.medical_training)
  medical += Math.min(3, trainCount)
  medical += yn(m.medical_medications) * 2
  medical += yn(m.medical_antibiotics) * 2
  medical = Math.min(15, Math.round(medical))

  // Security (0-10)
  let security = 0
  const defenseCount = multiCount(m.security_self_defense)
  security += Math.min(3, defenseCount)
  security += yn(m.security_community) * 2
  security += yn(m.security_evacuation_plan) * 2
  security += yn(m.security_bug_out_bag) * 2
  security += yn(m.security_opsec) * 1
  security = Math.min(10, Math.round(security))

  // Skills (0-10)
  let skills = 0
  skills += yn(m.skills_fire) * 2
  skills += yn(m.skills_navigation) * 2
  skills += yn(m.skills_water_purification_skill) * 2
  skills += yn(m.skills_construction) * 1
  skills += Math.min(2, multiCount(m.skills_technical))
  skills += yn(m.skills_medical_practical) * 1
  skills = Math.min(10, Math.round(skills))

  // Communication (0-5)
  let comm = 0
  comm += yn(m.comm_emergency_radio) * 1
  comm += yn(m.comm_ham_radio) * 2
  comm += yn(m.comm_offline_maps) * 1
  comm += yn(m.comm_family_plan) * 1
  comm = Math.min(5, Math.round(comm))

  // Mobility (0-5)
  let mobility = 0
  const vehicles = m.mobility_vehicles as string
  if (vehicles === '3+ vehicles') mobility += 2
  else if (vehicles === '2 vehicles') mobility += 2
  else if (vehicles === '1 vehicle') mobility += 1
  mobility += yn(m.mobility_routes) * 1
  mobility += yn(m.mobility_on_foot) * 1
  const fuelLiters = num(m.mobility_fuel_stored)
  mobility += fuelLiters > 50 ? 1 : 0
  mobility = Math.min(5, Math.round(mobility))

  // Financial (0-5)
  let financial = 0
  financial += yn(m.financial_cash) * 1
  financial += yn(m.financial_precious_metals) * 2
  financial += yn(m.financial_documents) * 1
  financial += yn(m.financial_trade_skills) * 1
  financial = Math.min(5, Math.round(financial))

  return { water, food, energy, shelter, medical, security, skills, communication: comm, mobility, financial }
}

export function totalScore(scores: CategoryScores): number {
  return Object.values(scores).reduce((a, b) => a + b, 0)
}

export function estimatedSurvivalDays(responses: UserResponse[]): number {
  const m = buildMap(responses)
  const members = Math.max(1, num(m.medical_household_members, 1))
  const storedLiters = num(m.water_stored_liters)
  const waterDays = storedLiters > 0 ? Math.floor(storedLiters / (members * 3)) : 0
  const foodDays = num(m.food_days_stored)
  if (waterDays === 0 && foodDays === 0) return 3
  if (waterDays === 0) return Math.min(3, foodDays)
  if (foodDays === 0) return Math.min(waterDays, 3)
  return Math.min(waterDays, foodDays)
}

export const SCORE_LABELS: Record<string, string> = {
  water: 'Water Security',
  food: 'Food Security',
  energy: 'Energy Independence',
  shelter: 'Shelter Safety',
  medical: 'Medical Readiness',
  security: 'Security & Community',
  skills: 'Skills & Knowledge',
  communication: 'Communication',
  mobility: 'Mobility',
  financial: 'Financial Resilience',
}

export const SCORE_MAX: Record<string, number> = {
  water: 15, food: 15, energy: 10, shelter: 10, medical: 15,
  security: 10, skills: 10, communication: 5, mobility: 5, financial: 5,
}
