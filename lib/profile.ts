export const PROFILE = {
  name: 'Durgesh',
  age: 33,
  city: 'Jaipur',
  startDate: '2026-04-24',
  durationDays: 90,

  body: {
    startWeight: 72,
    targetWeight: 67.5,
    startBodyFat: 17.5,
    targetBodyFat: 12.5,
    startMuscleMass: 33.5,
    targetMuscleMass: 34.5,
  },

  dailyTargets: {
    calories: 1950,
    protein: 160,
    carbs: 180,
    fats: 65,
    waterMl: 3500,
    steps: 8000,
  },

  meals: [
    { time: '7:00 AM',  label: 'Breakfast',     calories: 450,  protein: 35, items: '4 egg whites + 1 whole egg, 2 multigrain bread, banana, black coffee' },
    { time: '10:00 AM', label: 'Mid-morning',    calories: 250,  protein: 30, items: '1 scoop whey protein, 10 almonds + 5 walnuts' },
    { time: '1:00 PM',  label: 'Lunch',          calories: 600,  protein: 45, items: '150g chicken breast, brown rice / chapati, dal, salad, curd' },
    { time: '4:00 PM',  label: 'Pre-dinner',     calories: 200,  protein: 14, items: '2 boiled eggs, 1 fruit, green tea' },
    { time: '8:00 PM',  label: 'Dinner',         calories: 450,  protein: 36, items: '150g fish / chicken, 2 chapati, sabzi, salad' },
  ],

  foodRules: {
    do: [
      'Protein in every single meal',
      'Cook in minimal olive oil or ghee',
      'Last meal 2 hours before sleep',
      'Eat whole fruits — no juices',
    ],
    avoid: [
      'Sugar, maida, biscuits, namkeen',
      'Fruit juice',
      'Alcohol',
      'Packaged / processed food',
    ],
  },

  gymSplit: [
    { day: 'Monday',    focus: 'Chest + Triceps',         cardio: null },
    { day: 'Tuesday',   focus: 'Back + Biceps',           cardio: 'HIIT 15 min post workout' },
    { day: 'Wednesday', focus: 'Shoulders + Core',        cardio: null },
    { day: 'Thursday',  focus: 'Legs + Glutes',           cardio: 'HIIT 15 min post workout' },
    { day: 'Friday',    focus: 'Full Body + Cardio',      cardio: '30 min steady state' },
    { day: 'Saturday',  focus: 'Light walk 30–45 min',    cardio: null },
    { day: 'Sunday',    focus: 'Complete Rest',           cardio: null },
  ],

  supplements: [
    { name: 'Whey Protein',    dose: '1 scoop',   timing: 'Post workout' },
    { name: 'Creatine',        dose: '5g',        timing: 'Pre workout' },
    { name: 'Omega-3 Fish Oil',dose: '2 caps',    timing: 'With lunch' },
    { name: 'Zinc',            dose: '25mg',      timing: 'Night' },
    { name: 'Vitamin D3',      dose: '2000 IU',   timing: 'Morning' },
    { name: 'Biotin',          dose: '5000 mcg',  timing: 'Morning' },
  ],

  skincare: {
    morning: [
      'Salicylic acid foaming cleanser',
      'Light gel-based moisturiser',
      'SPF 50 PA+++ sunscreen',
    ],
    night: [
      'Salicylic acid cleanser',
      'Moisturiser (slightly heavier)',
      'Niacinamide 10% serum',
    ],
    keyRule: 'Never skip post-gym face wash — sweat + bacteria = breakouts',
    brands: ['Minimalist', 'Dot & Key', "Re'equil", 'Episoft AC'],
  },

  hair: [
    { treatment: 'Minoxidil 5%',          frequency: 'Daily',         product: 'Tugain 5%' },
    { treatment: 'Anti-DHT Shampoo',       frequency: '3x per week',   product: 'Nizral 2% Ketoconazole' },
    { treatment: 'Derma Roller 0.5mm',     frequency: '1x per week',   product: 'Amazon India ₹300–500' },
    { treatment: 'Oil Massage',            frequency: '2x per week',   product: 'Indulekha Bringha / Mamaearth Onion' },
    { treatment: 'Regular Wash',           frequency: 'Daily / alt day',product: 'Mild sulfate-free shampoo' },
  ],

  milestones: [
    { week: 2,  weight: 71,   bodyFat: 17,   note: 'Skin improving' },
    { week: 4,  weight: 70,   bodyFat: 16,   note: 'Slight definition' },
    { week: 6,  weight: 69,   bodyFat: 15,   note: 'Cheekbones emerging' },
    { week: 8,  weight: 68,   bodyFat: 14,   note: 'Jawline visible' },
    { week: 10, weight: 67.5, bodyFat: 13,   note: 'Sharp definition' },
    { week: 12, weight: 67,   bodyFat: 12.5, note: 'Full transformation' },
  ],
}

export const SYSTEM_PROMPT = `You are Transform Coach — a personal AI coach for Durgesh, a 33-year-old man from Jaipur who started a 90-day body transformation on April 24, 2026.

## His Full Profile

**Body Composition Goals**
- Start: 72 kg, 17.5% body fat, 33.5 kg muscle mass
- Target (12 weeks): 67–68 kg, 12–13% body fat, 34–35 kg muscle
- Daily: 1,950 kcal | 160g protein | 180g carbs | 65g fats | 3.5L water | 8,000 steps

**Meal Plan**
- 7:00 AM — 4 egg whites + 1 whole egg, 2 multigrain bread, banana, black coffee (450 kcal / 35g protein)
- 10:00 AM — 1 scoop whey, 10 almonds + 5 walnuts (250 kcal / 30g protein)
- 1:00 PM — 150g chicken breast, brown rice/chapati, dal, salad, curd (600 kcal / 45g protein)
- 4:00 PM — 2 boiled eggs, 1 fruit, green tea (200 kcal / 14g protein)
- 8:00 PM — 150g fish/chicken, 2 chapati, sabzi, salad (450 kcal / 36g protein)
- AVOID: sugar, maida, alcohol, packaged food, fruit juice

**Gym Split (5 days/week)**
- Mon: Chest + Triceps
- Tue: Back + Biceps + HIIT 15 min
- Wed: Shoulders + Core
- Thu: Legs + Glutes + HIIT 15 min
- Fri: Full Body + 30 min steady state cardio
- Sat: Light walk 30–45 min
- Sun: Rest

**Supplements**
- Whey Protein (post workout), Creatine 5g (pre workout), Omega-3 (lunch), Zinc 25mg (night), Vitamin D3 2000IU (morning), Biotin 5000mcg (morning)

**Skincare**
- Morning: Salicylic acid cleanser → gel moisturiser → SPF 50
- Night: Salicylic acid cleanser → moisturiser → Niacinamide 10% serum
- Rule: Always wash face after gym

**Hair (Norwood 2–3, intervention window)**
- Minoxidil 5% daily (Tugain), Ketoconazole shampoo 3x/week, Derma roller 1x/week, Oil 2x/week

**90-Day Milestones**
Week 2: 71kg | Week 4: 70kg | Week 6: 69kg | Week 8: 68kg | Week 10: 67.5kg | Week 12: 67kg

## Your Role
- Be direct, practical, and motivating — like a real coach
- Answer questions about his plan, diet, gym, skincare, hair
- Review his daily log data if he shares it
- Call him out if he's slacking, encourage him when he's consistent
- Give specific, actionable advice (not generic)
- Keep responses concise unless he asks for detail
- You know his full profile — reference it when relevant`
