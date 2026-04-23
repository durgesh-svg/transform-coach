'use client'

import { useState } from 'react'
import { PROFILE } from '@/lib/profile'

type Tab = 'gym' | 'meals' | 'supplements' | 'skincare' | 'hair'

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'gym',         label: 'Gym',         icon: '🏋️' },
  { id: 'meals',       label: 'Meals',       icon: '🍽️' },
  { id: 'supplements', label: 'Supps',       icon: '💊' },
  { id: 'skincare',    label: 'Skin',        icon: '✨' },
  { id: 'hair',        label: 'Hair',        icon: '💆' },
]

export default function PlanPage() {
  const [tab, setTab] = useState<Tab>('gym')

  return (
    <div className="px-4 pt-6 pb-2">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-white">Your Plan</h1>
        <p className="text-neutral-500 text-sm mt-0.5">90-day transformation blueprint</p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1.5 mb-5 overflow-x-auto pb-1 scrollbar-hide">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              tab === t.id
                ? 'bg-amber-500 text-black'
                : 'bg-[#1a1a1a] text-neutral-400 hover:text-neutral-200 border border-[#2a2a2a]'
            }`}
          >
            <span>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'gym' && <GymTab />}
      {tab === 'meals' && <MealsTab />}
      {tab === 'supplements' && <SuppsTab />}
      {tab === 'skincare' && <SkincareTab />}
      {tab === 'hair' && <HairTab />}
    </div>
  )
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-[#262626] bg-[#141414] p-4 ${className}`}>
      {children}
    </div>
  )
}

function GymTab() {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  const today = days[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]

  return (
    <div className="space-y-2.5">
      {PROFILE.gymSplit.map(g => {
        const isToday = g.day === today
        return (
          <div
            key={g.day}
            className={`rounded-xl border p-4 ${
              isToday ? 'border-amber-700/50 bg-amber-900/10' : 'border-[#262626] bg-[#141414]'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className={`text-xs font-medium ${isToday ? 'text-amber-400' : 'text-neutral-500'}`}>
                  {g.day}{isToday && ' — Today'}
                </p>
                <p className={`font-semibold mt-0.5 ${isToday ? 'text-white' : 'text-neutral-300'}`}>
                  {g.focus}
                </p>
                {g.cardio && (
                  <p className="text-xs text-amber-500/70 mt-1">+ {g.cardio}</p>
                )}
              </div>
              {g.focus === 'Complete Rest' && <span className="text-lg">😴</span>}
              {g.focus.includes('walk') && <span className="text-lg">🚶</span>}
              {!g.focus.includes('Rest') && !g.focus.includes('walk') && (
                <span className="text-lg">💪</span>
              )}
            </div>
          </div>
        )
      })}
      <Card>
        <p className="text-xs text-neutral-500 mb-2">Daily Target</p>
        <p className="text-sm text-neutral-300">
          <span className="text-amber-400 font-semibold">8,000</span> steps minimum every day
        </p>
      </Card>
    </div>
  )
}

function MealsTab() {
  return (
    <div className="space-y-3">
      {PROFILE.meals.map(m => (
        <Card key={m.time}>
          <div className="flex items-start justify-between mb-2">
            <div>
              <span className="text-xs text-neutral-500">{m.time}</span>
              <p className="text-white font-semibold">{m.label}</p>
            </div>
            <div className="text-right">
              <p className="text-amber-400 font-semibold text-sm">{m.calories} kcal</p>
              <p className="text-green-400 text-xs">{m.protein}g protein</p>
            </div>
          </div>
          <p className="text-sm text-neutral-400">{m.items}</p>
        </Card>
      ))}

      {/* Totals */}
      <div className="rounded-xl border border-amber-800/40 bg-amber-900/10 p-4">
        <p className="text-xs text-amber-600 uppercase tracking-widest mb-2">Daily Totals</p>
        <div className="grid grid-cols-4 gap-2 text-center">
          {[
            { label: 'Calories', value: '1,950', unit: 'kcal' },
            { label: 'Protein',  value: '160',   unit: 'g' },
            { label: 'Carbs',    value: '180',   unit: 'g' },
            { label: 'Fats',     value: '65',    unit: 'g' },
          ].map(({ label, value, unit }) => (
            <div key={label}>
              <p className="text-amber-400 font-bold">{value}</p>
              <p className="text-[10px] text-neutral-500">{unit}</p>
              <p className="text-[10px] text-neutral-600">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Rules */}
      <Card>
        <p className="text-xs text-neutral-500 uppercase tracking-widest mb-3">Food Rules</p>
        <div className="space-y-1.5">
          {PROFILE.foodRules.do.map(r => (
            <p key={r} className="text-sm text-neutral-300 flex gap-2"><span className="text-green-400">✓</span>{r}</p>
          ))}
          {PROFILE.foodRules.avoid.map(r => (
            <p key={r} className="text-sm text-neutral-300 flex gap-2"><span className="text-red-400">✗</span>{r}</p>
          ))}
        </div>
      </Card>
    </div>
  )
}

function SuppsTab() {
  return (
    <div className="space-y-2.5">
      {PROFILE.supplements.map(s => (
        <Card key={s.name}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-semibold">{s.name}</p>
              <p className="text-xs text-neutral-500 mt-0.5">{s.timing}</p>
            </div>
            <span className="rounded-lg bg-[#1f1f1f] border border-[#2a2a2a] px-2.5 py-1 text-sm text-amber-400 font-medium">
              {s.dose}
            </span>
          </div>
        </Card>
      ))}
    </div>
  )
}

function SkincareTab() {
  return (
    <div className="space-y-4">
      <Card>
        <p className="text-xs text-amber-500 uppercase tracking-widest mb-3">Morning</p>
        <ol className="space-y-2">
          {PROFILE.skincare.morning.map((step, i) => (
            <li key={step} className="flex gap-3 text-sm text-neutral-300">
              <span className="w-5 h-5 rounded-full bg-[#1f1f1f] border border-[#2a2a2a] flex items-center justify-center text-xs text-neutral-500 shrink-0 mt-0.5">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </Card>

      <Card>
        <p className="text-xs text-blue-400 uppercase tracking-widest mb-3">Night</p>
        <ol className="space-y-2">
          {PROFILE.skincare.night.map((step, i) => (
            <li key={step} className="flex gap-3 text-sm text-neutral-300">
              <span className="w-5 h-5 rounded-full bg-[#1f1f1f] border border-[#2a2a2a] flex items-center justify-center text-xs text-neutral-500 shrink-0 mt-0.5">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </Card>

      <div className="rounded-xl border border-red-800/40 bg-red-900/10 p-4">
        <p className="text-xs text-red-400 uppercase tracking-widest mb-1">Key Rule</p>
        <p className="text-sm text-neutral-300">{PROFILE.skincare.keyRule}</p>
      </div>

      <Card>
        <p className="text-xs text-neutral-500 uppercase tracking-widest mb-2">Recommended Brands</p>
        <div className="flex flex-wrap gap-2">
          {PROFILE.skincare.brands.map(b => (
            <span key={b} className="rounded-lg bg-[#1f1f1f] border border-[#2a2a2a] px-2.5 py-1 text-xs text-neutral-300">
              {b}
            </span>
          ))}
        </div>
      </Card>
    </div>
  )
}

function HairTab() {
  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-amber-800/40 bg-amber-900/10 p-4">
        <p className="text-xs text-amber-500 uppercase tracking-widest mb-1">Status</p>
        <p className="text-sm text-neutral-300">Norwood 2–3 — <span className="text-amber-400 font-medium">intervention window is still good.</span> Act now.</p>
      </div>

      {PROFILE.hair.map(h => (
        <div key={h.treatment} className="rounded-xl border border-[#262626] bg-[#141414] p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-white font-semibold">{h.treatment}</p>
              <p className="text-xs text-neutral-500 mt-0.5">{h.product}</p>
            </div>
            <span className="rounded-lg bg-[#1f1f1f] border border-[#2a2a2a] px-2 py-1 text-xs text-neutral-400">
              {h.frequency}
            </span>
          </div>
        </div>
      ))}

      <div className="rounded-xl border border-[#262626] bg-[#141414] p-4">
        <p className="text-xs text-neutral-500 uppercase tracking-widest mb-2">Best Hairstyle Now</p>
        <p className="text-sm text-neutral-300">Short textured crop — sides faded, top 1.5–2 inches, matte clay styling</p>
      </div>
    </div>
  )
}
