import type { Section } from '../types'

export const SECTIONS: Section[] = [
  {
    id: 'water',
    title: 'Water Security',
    description: 'Your access to clean water during a crisis',
    questions: [
      { id: 'water_stored_liters', text: 'How many liters of clean water do you currently have stored?', type: 'number', placeholder: '0', unit: 'liters', min: 0 },
      { id: 'water_backup_source', text: 'Do you have a backup water source (well, river, rainwater collection)?', type: 'yesno' },
      { id: 'water_backup_type', text: 'What type of backup water source do you have?', type: 'single', options: ['None','Well (private)','River/Stream nearby','Rainwater collection system','Neighbour/community well','Multiple sources'] },
      { id: 'water_filter', text: 'Do you own a water filtration or purification system?', type: 'yesno' },
      { id: 'water_filter_type', text: 'What water purification methods do you have?', type: 'multi', options: ['None','Water filter (Berkey/Lifestraw etc.)','Iodine/chlorine tablets','UV purifier','Boiling capability','Reverse osmosis system'] },
      { id: 'water_rainfall_catchment', text: 'Do you have the ability to collect rainwater?', type: 'yesno' },
    ]
  },
  {
    id: 'food',
    title: 'Food Security',
    description: 'Your food reserves and production capability',
    questions: [
      { id: 'food_days_stored', text: 'How many days of food do you currently have stored for your household?', type: 'number', placeholder: '7', unit: 'days', min: 0 },
      { id: 'food_preservation', text: 'Do you know how to preserve food (canning, dehydrating, smoking)?', type: 'yesno' },
      { id: 'food_farming', text: 'Do you have the ability to grow food (garden, farm, greenhouse)?', type: 'yesno' },
      { id: 'food_farming_size', text: 'What is the scale of your food production capability?', type: 'single', options: ['None','Small container garden','Large vegetable garden','Small farm (< 1 acre)','Large farm (1+ acres)','Greenhouse'] },
      { id: 'food_seeds', text: 'Do you have non-hybrid/heirloom seeds stored?', type: 'yesno' },
      { id: 'food_hunting_fishing', text: 'Can you hunt, fish, or trap for food?', type: 'multi', options: ['None of these','Hunting (firearms)','Hunting (bow)','Fishing','Trapping','Foraging wild plants'] },
    ]
  },
  {
    id: 'energy',
    title: 'Energy Independence',
    description: 'Power sources when the grid goes down',
    questions: [
      { id: 'energy_solar', text: 'Do you have solar panels installed?', type: 'yesno' },
      { id: 'energy_solar_capacity', text: 'What is your solar capacity?', type: 'single', options: ['None','Small portable panels (< 200W)','Medium system (200-1000W)','Full home system (1000W+)','Off-grid complete system'] },
      { id: 'energy_generator', text: 'Do you own a generator or large battery backup?', type: 'yesno' },
      { id: 'energy_generator_type', text: 'What backup power do you have?', type: 'multi', options: ['None','Gasoline generator','Diesel generator','Propane generator','Large battery bank (LiFePO4 etc.)','Wind turbine','Micro-hydro system'] },
      { id: 'energy_fuel_stored', text: 'How many days of fuel do you have stored for heating/power?', type: 'number', placeholder: '0', unit: 'days', min: 0 },
      { id: 'energy_firewood', text: 'Do you have access to firewood or a wood-burning stove?', type: 'yesno' },
    ]
  },
  {
    id: 'shelter',
    title: 'Shelter Safety',
    description: 'Your home\'s ability to protect you',
    questions: [
      { id: 'shelter_type', text: 'What type of home do you live in?', type: 'single', options: ['Apartment (high rise)','Apartment (low rise)','Townhouse/terraced','Detached house','Rural farmhouse','Underground/bunker','Other'] },
      { id: 'shelter_owns', text: 'Do you own your home (vs. renting)?', type: 'yesno' },
      { id: 'shelter_insulation', text: 'Is your home well insulated (can maintain heat without central heating)?', type: 'yesno' },
      { id: 'shelter_sealed', text: 'Could you seal your home against chemical/biological contamination?', type: 'yesno' },
      { id: 'shelter_basement', text: 'Do you have a basement or underground room?', type: 'yesno' },
      { id: 'shelter_vulnerabilities', text: 'What are the main shelter vulnerabilities? (select all that apply)', type: 'multi', options: ['None significant','Flood risk','Wildfire risk','Earthquake zone','Urban/dense population','Near military/industrial targets','No secure perimeter'] },
    ]
  },
  {
    id: 'medical',
    title: 'Medical Readiness',
    description: 'Healthcare capability when hospitals are unavailable',
    questions: [
      { id: 'medical_first_aid', text: 'What is the quality of your first aid kit?', type: 'single', options: ['None','Basic (bandages only)','Standard kit','Advanced kit (tourniquets, Israeli bandage, etc.)','Trauma kit (surgical instruments, etc.)'] },
      { id: 'medical_training', text: 'What medical training do you have?', type: 'multi', options: ['None','Basic first aid course','CPR certified','Wilderness first aid','EMT/Paramedic','Nurse/Doctor','Combat first aid (TCCC)'] },
      { id: 'medical_medications', text: 'Do you have a 30+ day supply of any prescription medications you need?', type: 'yesno' },
      { id: 'medical_antibiotics', text: 'Do you have stored antibiotics (fish antibiotics or prescription)?', type: 'yesno' },
      { id: 'medical_dental', text: 'Do you have a dental emergency kit?', type: 'yesno' },
      { id: 'medical_household_members', text: 'How many people are in your household?', type: 'number', placeholder: '1', unit: 'people', min: 1, max: 50 },
    ]
  },
  {
    id: 'security',
    title: 'Security & Community',
    description: 'Protection and mutual aid networks',
    questions: [
      { id: 'security_self_defense', text: 'Do you have self-defense capabilities?', type: 'multi', options: ['None','Firearm(s)','Non-lethal deterrents (pepper spray etc.)','Martial arts training','Guard dog','Perimeter security (fencing, locks)','Security alarm/cameras'] },
      { id: 'security_community', text: 'Do you have a trusted community/group you could band with?', type: 'yesno' },
      { id: 'security_community_size', text: 'How many trusted people are in your immediate network?', type: 'single', options: ['Just myself','2-3 people','4-10 people','11-25 people','25+ people'] },
      { id: 'security_evacuation_plan', text: 'Do you have a documented evacuation plan with multiple routes?', type: 'yesno' },
      { id: 'security_bug_out_bag', text: 'Do you have a bug-out bag (72-hour kit) packed and ready?', type: 'yesno' },
      { id: 'security_opsec', text: 'Do you practice operational security (not broadcasting your preps)?', type: 'yesno' },
    ]
  },
  {
    id: 'skills',
    title: 'Skills & Knowledge',
    description: 'Practical survival knowledge',
    questions: [
      { id: 'skills_fire', text: 'Can you start a fire without matches or a lighter?', type: 'yesno' },
      { id: 'skills_navigation', text: 'Can you navigate using a map and compass without GPS?', type: 'yesno' },
      { id: 'skills_water_purification_skill', text: 'Do you know multiple methods to purify water in the wild?', type: 'yesno' },
      { id: 'skills_construction', text: 'Can you build or repair shelter?', type: 'yesno' },
      { id: 'skills_technical', text: 'What technical/trade skills do you have?', type: 'multi', options: ['None','Mechanical/auto repair','Electrical work','Plumbing','Carpentry','Welding','Electronics/radio repair'] },
      { id: 'skills_medical_practical', text: 'Have you practiced emergency medical procedures?', type: 'yesno' },
    ]
  },
  {
    id: 'communication',
    title: 'Communication',
    description: 'Staying informed and coordinating when networks fail',
    questions: [
      { id: 'comm_emergency_radio', text: 'Do you own a hand-crank or battery emergency radio (AM/FM/NOAA)?', type: 'yesno' },
      { id: 'comm_ham_radio', text: 'Do you own a HAM radio or satellite communicator (Garmin inReach etc.)?', type: 'yesno' },
      { id: 'comm_offline_maps', text: 'Do you have downloaded offline maps for your region?', type: 'yesno' },
      { id: 'comm_family_plan', text: 'Do you have a communication plan with family/group (rally points, check-in times)?', type: 'yesno' },
      { id: 'comm_walkie_talkies', text: 'Do you have walkie-talkies or two-way radios?', type: 'yesno' },
    ]
  },
  {
    id: 'mobility',
    title: 'Mobility & Evacuation',
    description: 'Your ability to move when necessary',
    questions: [
      { id: 'mobility_vehicles', text: 'How many operational vehicles do you have?', type: 'single', options: ['None','1 vehicle','2 vehicles','3+ vehicles'] },
      { id: 'mobility_vehicle_type', text: 'What is your primary vehicle type?', type: 'single', options: ['No vehicle','Standard car (2WD)','SUV/4WD','Truck','Motorcycle','Bicycle only','Multiple types'] },
      { id: 'mobility_fuel_stored', text: 'How many gallons/liters of fuel do you have stored?', type: 'number', placeholder: '0', unit: 'liters', min: 0 },
      { id: 'mobility_routes', text: 'Have you identified multiple evacuation routes from your home?', type: 'yesno' },
      { id: 'mobility_on_foot', text: 'Could you travel 30+ miles on foot if necessary?', type: 'yesno' },
    ]
  },
  {
    id: 'financial',
    title: 'Financial Resilience',
    description: 'Resources when banks and digital systems fail',
    questions: [
      { id: 'financial_cash', text: 'Do you have cash stored at home (enough for 1+ month of expenses)?', type: 'yesno' },
      { id: 'financial_precious_metals', text: 'Do you own physical gold or silver for trade?', type: 'yesno' },
      { id: 'financial_documents', text: 'Do you have physical copies of important documents (ID, insurance, deeds)?', type: 'yesno' },
      { id: 'financial_trade_skills', text: 'Do you have valuable trade skills or goods for barter?', type: 'yesno' },
      { id: 'financial_debt', text: 'Are you relatively debt-free or have manageable debt?', type: 'yesno' },
    ]
  },
  {
    id: 'location',
    title: 'Location & Terrain',
    description: 'Your geographic advantages and vulnerabilities',
    questions: [
      { id: 'location_urban_rural', text: 'How would you describe your location?', type: 'single', options: ['Dense urban (city center)','Suburban','Small town','Rural (within 30min of town)','Remote rural','Wilderness/off-grid'] },
      { id: 'location_climate', text: 'What climate zone are you in?', type: 'single', options: ['Tropical/humid','Subtropical','Temperate','Continental (cold winters)','Arctic/subarctic','Desert/arid','Mediterranean'] },
      { id: 'location_natural_disasters', text: 'Which natural disasters are most likely in your area?', type: 'multi', options: ['None significant','Earthquakes','Hurricanes/Typhoons','Tornadoes','Flooding','Wildfires','Blizzards/Ice storms','Volcanic activity','Tsunamis'] },
      { id: 'location_military_proximity', text: 'Are you within 50 miles of a major military base or nuclear facility?', type: 'yesno' },
      { id: 'location_border_proximity', text: 'Are you near an international border or known conflict flashpoint?', type: 'yesno' },
    ]
  },
  {
    id: 'mental',
    title: 'Mental & Physical Readiness',
    description: 'Your personal capability to endure hardship',
    questions: [
      { id: 'mental_physical_fitness', text: 'How would you rate your overall physical fitness?', type: 'single', options: ['Poor (sedentary)','Below average','Average','Good','Excellent (athlete)'] },
      { id: 'mental_stress', text: 'Have you experienced high-stress situations and performed well?', type: 'yesno' },
      { id: 'mental_prepping', text: 'How long have you been actively preparing for emergencies?', type: 'single', options: ['Not at all','Just starting','1-6 months','6-12 months','1-3 years','3+ years'] },
      { id: 'mental_mindset', text: 'Do you maintain a calm, rational mindset under pressure?', type: 'yesno' },
      { id: 'mental_dependents', text: 'Do you have dependents who need special care (children, elderly, disabled)?', type: 'yesno' },
    ]
  },
]
