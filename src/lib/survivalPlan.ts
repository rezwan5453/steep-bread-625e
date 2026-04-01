import type { CategoryScores, UserResponse } from '../types'
import { SCORE_MAX } from './scoring'

type ResponseMap = Record<string, string | string[] | number | boolean>

function buildMap(responses: UserResponse[]): ResponseMap {
  const m: ResponseMap = {}
  for (const r of responses) { m[r.question_id] = r.answer }
  return m
}

function pct(score: number, max: number) { return Math.round((score / max) * 100) }
function arr(val: unknown): string[] {
  if (Array.isArray(val)) return val
  if (typeof val === 'string') return [val]
  return []
}

export function generateSurvivalPlan(
  scores: CategoryScores,
  responses: UserResponse[],
  country: string
): string {
  const m = buildMap(responses)
  const members = Math.max(1, Number(m.medical_household_members) || 1)
  const waterLiters = Number(m.water_stored_liters) || 0
  const foodDays = Number(m.food_days_stored) || 0
  const waterDays = waterLiters > 0 ? Math.floor(waterLiters / (members * 3)) : 0

  const sections: string[] = []

  // Header
  sections.push(`SURVIVAL ASSESSMENT REPORT — ${country.toUpperCase()}`)
  sections.push(`CLASSIFIED: PERSONAL USE ONLY`)
  sections.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
  sections.push(``)

  // Executive Summary
  const total = Object.values(scores).reduce((a,b) => a+b, 0)
  let readinessLevel = 'CRITICAL'
  if (total >= 80) readinessLevel = 'EXCELLENT'
  else if (total >= 60) readinessLevel = 'GOOD'
  else if (total >= 40) readinessLevel = 'MODERATE'
  else if (total >= 20) readinessLevel = 'LOW'

  sections.push(`EXECUTIVE SUMMARY`)
  sections.push(`-----------------`)
  sections.push(`Overall Readiness: ${readinessLevel} (${total}/100)`)
  const estDays = waterDays > 0 || foodDays > 0
    ? Math.min(waterDays > 0 ? waterDays : Infinity, foodDays > 0 ? foodDays : Infinity)
    : 3
  sections.push(`Estimated Survival Window: ${estDays} days (current stores)`)
  sections.push(`Location: ${country}`)
  sections.push(`Household Size: ${members} ${members === 1 ? 'person' : 'people'}`)
  sections.push(``)

  // Strengths
  const strengths: string[] = []
  const gaps: string[] = []
  for (const [key, score] of Object.entries(scores)) {
    const max = SCORE_MAX[key] || 10
    const p = pct(score, max)
    if (p >= 70) strengths.push(key)
    else if (p < 40) gaps.push(key)
  }

  sections.push(`STRENGTHS`)
  sections.push(`---------`)
  if (strengths.length === 0) {
    sections.push(`No strong categories identified. Focus on all areas below.`)
  } else {
    strengths.forEach(s => sections.push(`✓ ${s.replace(/_/g,' ').toUpperCase()} — Well prepared`))
  }
  sections.push(``)

  sections.push(`CRITICAL GAPS`)
  sections.push(`-------------`)
  if (gaps.length === 0) {
    sections.push(`No critical gaps identified. Maintain and improve all areas.`)
  } else {
    gaps.forEach(g => sections.push(`⚠ ${g.replace(/_/g,' ').toUpperCase()} — Requires immediate attention`))
  }
  sections.push(``)

  // Water
  sections.push(`SECTION 1: WATER SECURITY (Score: ${scores.water}/15)`)
  sections.push(`─────────────────────────────────────────────────`)
  if (waterLiters === 0) {
    sections.push(`CRITICAL: You have no stored water. This is your most urgent priority.`)
    sections.push(`ACTION: Purchase 100+ liters of bottled water immediately. Target 90 liters per person.`)
  } else if (waterDays < 7) {
    sections.push(`WARNING: You have only ${waterDays} days of water for your household.`)
    sections.push(`ACTION: Increase to minimum 30-day supply (${members * 3 * 30} liters for your household).`)
  } else {
    sections.push(`CURRENT: ${waterDays} days of stored water for ${members} people.`)
  }
  if (!m.water_filter || m.water_filter === 'false') {
    sections.push(`ACTION: Purchase a quality gravity filter (Berkey, Sawyer, etc.) — can filter thousands of liters.`)
  }
  if (!m.water_backup_source || m.water_backup_source === 'false') {
    sections.push(`ACTION: Identify your nearest natural water source and learn to purify it.`)
  }
  if (!m.water_rainfall_catchment || m.water_rainfall_catchment === 'false') {
    sections.push(`ACTION: Install rainwater collection barrels (100-200L capacity per barrel).`)
  }
  sections.push(``)

  // Food
  sections.push(`SECTION 2: FOOD SECURITY (Score: ${scores.food}/15)`)
  sections.push(`─────────────────────────────────────────────────`)
  if (foodDays < 7) {
    sections.push(`CRITICAL: Only ${foodDays} days of food stored. Begin building reserves immediately.`)
    sections.push(`ACTION: Build to 90-day supply. Focus on calorie-dense, shelf-stable foods.`)
    sections.push(`PRIORITY ITEMS: Rice, beans, oats, canned goods, cooking oil, salt, honey.`)
  } else if (foodDays < 30) {
    sections.push(`WARNING: ${foodDays} days stored. Aim for 90-day minimum.`)
    sections.push(`ACTION: Add 3 months of food in calorie-dense shelf-stable items.`)
  } else {
    sections.push(`CURRENT: ${foodDays} days of food stored. ${foodDays >= 90 ? 'Good supply.' : 'Continue building to 90+ days.'}`)
  }
  if (!m.food_farming || m.food_farming === 'false') {
    sections.push(`ACTION: Start a vegetable garden. Even containers can provide supplemental nutrition.`)
    sections.push(`         Focus on high-yield crops: potatoes, beans, squash, greens.`)
  }
  if (!m.food_seeds || m.food_seeds === 'false') {
    sections.push(`ACTION: Purchase heirloom/non-hybrid seed bank. Seeds are currency in collapse scenarios.`)
  }
  sections.push(``)

  // Energy
  sections.push(`SECTION 3: ENERGY INDEPENDENCE (Score: ${scores.energy}/10)`)
  sections.push(`─────────────────────────────────────────────────────────`)
  if (scores.energy < 4) {
    sections.push(`CRITICAL: Very limited backup power. Grid failure will severely impact you.`)
    sections.push(`PRIORITY 1: Obtain a portable solar charging system (200-400W) for critical device charging.`)
    sections.push(`PRIORITY 2: Stockpile candles, oil lamps, rechargeable batteries, and hand tools.`)
    sections.push(`PRIORITY 3: Consider a generator with 30-day fuel supply if budget allows.`)
  }
  if (!m.energy_firewood || m.energy_firewood === 'false') {
    sections.push(`ACTION: Acquire a wood stove or rocket stove for cooking/heating without electricity.`)
    sections.push(`         Stockpile 2-3 cords of firewood.`)
  }
  sections.push(``)

  // Shelter
  sections.push(`SECTION 4: SHELTER SAFETY (Score: ${scores.shelter}/10)`)
  sections.push(`─────────────────────────────────────────────────────`)
  const shelterType = m.shelter_type as string || 'Unknown'
  sections.push(`Current Shelter: ${shelterType}`)
  if (shelterType.includes('Apartment') || shelterType.includes('high rise')) {
    sections.push(`WARNING: Urban apartments are among the most vulnerable in conflict scenarios.`)
    sections.push(`ACTION: Develop a robust bug-out plan to a safer location within 2 hours.`)
    sections.push(`ACTION: Identify rural retreat location with trusted contacts.`)
  }
  if (!m.shelter_sealed || m.shelter_sealed === 'false') {
    sections.push(`ACTION: Purchase plastic sheeting and duct tape to seal rooms against NBC contamination.`)
    sections.push(`         Practice sealing a safe room in under 5 minutes.`)
  }
  const vulns = arr(m.shelter_vulnerabilities).filter(v => v !== 'None significant')
  if (vulns.length > 0) {
    sections.push(`Known Vulnerabilities: ${vulns.join(', ')}`)
    sections.push(`ACTION: Develop specific mitigation plans for each vulnerability.`)
  }
  sections.push(``)

  // Medical
  sections.push(`SECTION 5: MEDICAL READINESS (Score: ${scores.medical}/15)`)
  sections.push(`─────────────────────────────────────────────────────────`)
  const kitLevel = m.medical_first_aid as string || 'None'
  if (kitLevel === 'None' || kitLevel === 'Basic (bandages only)') {
    sections.push(`CRITICAL: Inadequate medical supplies. In SHTF scenarios, infection and injury are top killers.`)
    sections.push(`PRIORITY: Build an IFAK (Individual First Aid Kit):`)
    sections.push(`  - Tourniquet (CAT or SOFTT-W)`)
    sections.push(`  - Israeli bandage / pressure dressing`)
    sections.push(`  - Hemostatic gauze (QuikClot)`)
    sections.push(`  - Chest seals (occlusive)`)
    sections.push(`  - N-acetyl cysteine, amoxicillin, ciprofloxacin`)
  }
  const trainingList = arr(m.medical_training).filter(t => t !== 'None')
  if (trainingList.length === 0) {
    sections.push(`ACTION: Complete a Wilderness First Aid course immediately. This skill saves lives.`)
    sections.push(`         Consider CPR certification — takes only 1 day.`)
  }
  sections.push(``)

  // Security
  sections.push(`SECTION 6: SECURITY & COMMUNITY (Score: ${scores.security}/10)`)
  sections.push(`─────────────────────────────────────────────────────────────`)
  if (!m.security_community || m.security_community === 'false') {
    sections.push(`WARNING: No trusted community group identified. Lone survival is extremely difficult.`)
    sections.push(`ACTION: Begin building relationships with like-minded neighbors and local preppers.`)
    sections.push(`         Mutual aid networks dramatically increase survival probability.`)
  }
  if (!m.security_evacuation_plan || m.security_evacuation_plan === 'false') {
    sections.push(`ACTION: Document 3 evacuation routes from your home. Include:`)
    sections.push(`  - Primary route (fastest)`)
    sections.push(`  - Secondary route (bypasses highways)`)
    sections.push(`  - On-foot route (in case of fuel shortage or road blockage)`)
  }
  if (!m.security_bug_out_bag || m.security_bug_out_bag === 'false') {
    sections.push(`ACTION: Assemble a 72-hour bug-out bag with:`)
    sections.push(`  - Water (2L) + filter straw`)
    sections.push(`  - 3 days of food (energy bars, jerky)`)
    sections.push(`  - First aid kit, fire starter, knife, emergency blanket`)
    sections.push(`  - Cash, important documents (copies)`)
    sections.push(`  - Map, compass, flashlight, extra clothes`)
  }
  sections.push(``)

  // Skills
  sections.push(`SECTION 7: SKILLS & KNOWLEDGE (Score: ${scores.skills}/10)`)
  sections.push(`──────────────────────────────────────────────────────────`)
  if (!m.skills_fire || m.skills_fire === 'false') {
    sections.push(`ACTION: Practice fire starting with bow drill, ferro rod, and flint & steel.`)
    sections.push(`         Can start fire in wet conditions? Practice until yes.`)
  }
  if (!m.skills_navigation || m.skills_navigation === 'false') {
    sections.push(`ACTION: Learn map and compass navigation. GPS will fail. Download offline maps NOW.`)
    sections.push(`         Purchase: topographic map of your region + quality compass.`)
  }
  if (!m.skills_water_purification_skill || m.skills_water_purification_skill === 'false') {
    sections.push(`ACTION: Learn multiple water purification methods:`)
    sections.push(`  - Boiling (1 min rolling boil)`)
    sections.push(`  - Bleach treatment (8 drops per gallon for clear water)`)
    sections.push(`  - Solar disinfection (SODIS method)`)
    sections.push(`  - Improvised sand/charcoal/gravel filter`)
  }
  sections.push(``)

  // Communication
  sections.push(`SECTION 8: COMMUNICATION (Score: ${scores.communication}/5)`)
  sections.push(`─────────────────────────────────────────────────────────`)
  if (!m.comm_emergency_radio || m.comm_emergency_radio === 'false') {
    sections.push(`ACTION: Purchase a hand-crank AM/FM/NOAA weather radio (under $40).`)
    sections.push(`         This is your primary source of emergency broadcasts.`)
  }
  if (!m.comm_ham_radio || m.comm_ham_radio === 'false') {
    sections.push(`ACTION: Consider obtaining HAM radio license. GMRS/FRS walkie-talkies as minimum.`)
    sections.push(`         In grid-down, HAM radio is the backbone of emergency communication.`)
  }
  if (!m.comm_family_plan || m.comm_family_plan === 'false') {
    sections.push(`ACTION: Create a family communication plan NOW:`)
    sections.push(`  - Two rally points (one local, one remote)`)
    sections.push(`  - Check-in times if separated`)
    sections.push(`  - Out-of-area contact person`)
    sections.push(`  - Code words and verification procedures`)
  }
  sections.push(``)

  // Mobility
  sections.push(`SECTION 9: MOBILITY & EVACUATION (Score: ${scores.mobility}/5)`)
  sections.push(`────────────────────────────────────────────────────────────`)
  if (!m.mobility_routes || m.mobility_routes === 'false') {
    sections.push(`ACTION: Drive and walk your evacuation routes. Know them by memory.`)
    sections.push(`         Include routes that avoid highways and major population centers.`)
  }
  if (!m.mobility_on_foot || m.mobility_on_foot === 'false') {
    sections.push(`ACTION: Build physical fitness for 30+ mile travel on foot.`)
    sections.push(`         Start with weighted hiking (20-30 lbs) — build endurance over weeks.`)
  }
  const fuelLiters = Number(m.mobility_fuel_stored) || 0
  if (fuelLiters < 50) {
    sections.push(`ACTION: Store minimum 50 liters of treated fuel (add stabilizer for 1+ year storage).`)
    sections.push(`         Rotate stock every 12 months.`)
  }
  sections.push(``)

  // Financial
  sections.push(`SECTION 10: FINANCIAL RESILIENCE (Score: ${scores.financial}/5)`)
  sections.push(`──────────────────────────────────────────────────────────────`)
  if (!m.financial_cash || m.financial_cash === 'false') {
    sections.push(`ACTION: Keep 1 month of expenses in cash at home (small bills).`)
    sections.push(`         Banks and ATMs will be inaccessible in crisis scenarios.`)
  }
  if (!m.financial_precious_metals || m.financial_precious_metals === 'false') {
    sections.push(`ACTION: Convert 5-10% of savings to physical silver (pre-1964 coins or 1oz rounds).`)
    sections.push(`         Gold/silver maintain value when fiat currency collapses.`)
  }
  if (!m.financial_documents || m.financial_documents === 'false') {
    sections.push(`ACTION: Make waterproof copies of: passport, ID, insurance policies, property deeds,`)
    sections.push(`         medical records, bank account info. Store in go-bag and secure off-site location.`)
  }
  sections.push(``)

  // Country-specific advice
  sections.push(`COUNTRY-SPECIFIC ASSESSMENT: ${country.toUpperCase()}`)
  sections.push(`────────────────────────────────────────────────`)
  sections.push(`Based on your location in ${country}:`)
  
  // Generic but useful country-level advice
  const climate = m.location_climate as string || ''
  const urban = m.location_urban_rural as string || ''
  
  if (climate.includes('Arctic') || climate.includes('Continental')) {
    sections.push(`• Cold climate priority: Heating fuel, insulation, and winter clothing are CRITICAL.`)
    sections.push(`  Hypothermia can kill in hours. Never let heating stores drop below 60-day supply.`)
    sections.push(`• Extended growing season limitation: Maximize preservation of summer/fall harvests.`)
    sections.push(`• Cache supplies at multiple locations to protect against blizzard isolation.`)
  } else if (climate.includes('Tropical') || climate.includes('humid')) {
    sections.push(`• Tropical priority: Water-borne diseases are your primary medical threat.`)
    sections.push(`  Treat ALL water sources. Stockpile water purification tablets and oral rehydration salts.`)
    sections.push(`• Heat and humidity will degrade stored food faster — use mylar bags and oxygen absorbers.`)
    sections.push(`• Extended growing season is an advantage — maximize food production.`)
  } else if (climate.includes('Desert') || climate.includes('arid')) {
    sections.push(`• Desert priority: Water is scarce — triple your water storage target.`)
    sections.push(`  Know every water source within 100 miles.`)
    sections.push(`• Heat injury risk is high. Stock electrolytes and know heat illness treatment.`)
    sections.push(`• Limited vegetation for food production — maximize storage instead.`)
  } else {
    sections.push(`• Know your local threat environment: natural disasters, political stability, critical infrastructure.`)
    sections.push(`• Connect with local emergency management resources and community groups.`)
    sections.push(`• Identify locally available resources: water sources, hunting areas, farmland.`)
  }
  
  if (urban.includes('urban') || urban.includes('Suburban')) {
    sections.push(`• Urban environment: High population density creates security and resource competition risks.`)
    sections.push(`  Have a clear plan to evacuate to a safer rural location within 24 hours.`)
    sections.push(`• OPSEC is critical in dense areas. Do not discuss your preparations with neighbors.`)
  } else if (urban.includes('Rural') || urban.includes('Remote')) {
    sections.push(`• Rural advantage: Lower threat density, more space for food production and resources.`)
    sections.push(`  Focus on self-sufficiency — services and resupply will be limited.`)
    sections.push(`• Community with neighbors is both more feasible and more critical in rural settings.`)
  }

  sections.push(``)

  // Priority Action Plan
  sections.push(`TOP 5 PRIORITY ACTIONS`)
  sections.push(`──────────────────────`)
  const priorities: string[] = []
  
  if (waterDays < 7) priorities.push(`1. WATER: Store minimum ${members * 3 * 30} liters of water this week`)
  if (foodDays < 30) priorities.push(`${priorities.length+1}. FOOD: Build 30-day food supply — focus on calories first`)
  if (scores.medical < 6) priorities.push(`${priorities.length+1}. MEDICAL: Assemble trauma kit + complete first aid course`)
  if (!m.security_bug_out_bag) priorities.push(`${priorities.length+1}. BUG-OUT BAG: Pack 72-hour bag and store by door`)
  if (!m.comm_emergency_radio) priorities.push(`${priorities.length+1}. COMMS: Purchase hand-crank emergency radio ($30)`)
  if (scores.energy < 4) priorities.push(`${priorities.length+1}. POWER: Get portable solar charger + battery bank`)
  if (scores.skills < 4) priorities.push(`${priorities.length+1}. SKILLS: Take first aid and wilderness survival courses`)
  if (!m.security_community || m.security_community === 'false') priorities.push(`${priorities.length+1}. COMMUNITY: Build trusted mutual aid network with 5+ people`)
  
  // Fill to 5 if needed
  const defaults = [
    'Conduct a full home inventory and address biggest gap',
    'Review and practice your evacuation plan',
    'Download offline maps and purchase a quality compass',
  ]
  let di = 0
  while (priorities.length < 5 && di < defaults.length) {
    priorities.push(`${priorities.length+1}. ${defaults[di++]}`)
  }
  
  priorities.slice(0, 5).forEach(p => sections.push(p))
  sections.push(``)
  sections.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
  sections.push(`END OF REPORT — KEEP SECURE — REVIEW QUARTERLY`)

  return sections.join('\n')
}
