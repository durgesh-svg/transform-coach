'use client'

import { useState } from 'react'
import { PROFILE } from '@/lib/profile'

type Tab = 'gym' | 'meals' | 'supplements' | 'skincare' | 'hair'

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'gym',         label: 'Gym',   icon: '🏋️' },
  { id: 'meals',       label: 'Meals', icon: '🍽️' },
  { id: 'supplements', label: 'Supps', icon: '💊' },
  { id: 'skincare',    label: 'Skin',  icon: '✨' },
  { id: 'hair',        label: 'Hair',  icon: '💆' },
]

export default function PlanPage() {
  const [tab, setTab] = useState<Tab>('gym')

  return (
    <div className="px-4 pt-6 pb-2">
      <div className="mb-4">
        <h1 className="text-2xl font-extrabold text-stone-900">Your Plan</h1>
        <p className="text-stone-500 text-sm mt-0.5">90-day transformation blueprint</p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              tab === t.id
                ? 'bg-orange-500 text-white shadow-md shadow-orange-200'
                : 'bg-white text-stone-500 hover:text-stone-700 border border-stone-200'
            }`}
          >
            <span>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'gym'         && <GymTab />}
      {tab === 'meals'       && <MealsTab />}
      {tab === 'supplements' && <SuppsTab />}
      {tab === 'skincare'    && <SkincareTab />}
      {tab === 'hair'        && <HairTab />}
    </div>
  )
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-stone-200 bg-white shadow-sm p-4 ${className}`}>
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
            className={`rounded-2xl border p-4 transition-all ${
              isToday
                ? 'border-orange-200 bg-orange-50 shadow-sm shadow-orange-100'
                : 'border-stone-200 bg-white'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className={`text-xs font-bold ${isToday ? 'text-orange-500' : 'text-stone-400'}`}>
                  {g.day}{isToday && ' — Today'}
                </p>
                <p className={`font-semibold mt-0.5 ${isToday ? 'text-stone-900' : 'text-stone-700'}`}>
                  {g.focus}
                </p>
                {g.cardio && (
                  <p className="text-xs text-orange-500 mt-1">+ {g.cardio}</p>
                )}
              </div>
              <span className="text-xl">
                {g.focus === 'Complete Rest' ? '😴' : g.focus.includes('walk') ? '🚶' : '💪'}
              </span>
            </div>
          </div>
        )
      })}
      <Card>
        <p className="text-xs font-bold text-stone-400 mb-1">Daily Target</p>
        <p className="text-sm text-stone-700">
          <span className="text-orange-500 font-bold">8,000</span> steps minimum every day
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
              <span className="text-xs text-stone-400 font-medium">{m.time}</span>
              <p className="text-stone-900 font-bold">{m.label}</p>
            </div>
            <div className="text-right">
              <p className="text-orange-500 font-bold text-sm">{m.calories} kcal</p>
              <p className="text-green-600 text-xs font-semibold">{m.protein}g protein</p>
            </div>
          </div>
          <p className="text-sm text-stone-500">{m.items}</p>
        </Card>
      ))}

      <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4">
        <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-3">Daily Totals</p>
        <div className="grid grid-cols-4 gap-2 text-center">
          {[
            { label: 'Calories', value: '1,950', unit: 'kcal' },
            { label: 'Protein',  value: '160',   unit: 'g' },
            { label: 'Carbs',    value: '180',   unit: 'g' },
            { label: 'Fats',     value: '65',    unit: 'g' },
          ].map(({ label, value, unit }) => (
            <div key={label}>
              <p className="text-orange-500 font-extrabold">{value}</p>
              <p className="text-[10px] text-stone-400">{unit}</p>
              <p className="text-[10px] text-stone-400">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <Card>
        <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3">Food Rules</p>
        <div className="space-y-1.5">
          {PROFILE.foodRules.do.map(r => (
            <p key={r} className="text-sm text-stone-700 flex gap-2"><span className="text-green-500 font-bold">✓</span>{r}</p>
          ))}
          {PROFILE.foodRules.avoid.map(r => (
            <p key={r} className="text-sm text-stone-700 flex gap-2"><span className="text-red-400 font-bold">✗</span>{r}</p>
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
              <p className="text-stone-900 font-bold">{s.name}</p>
              <p className="text-xs text-stone-400 mt-0.5">{s.timing}</p>
            </div>
            <span className="rounded-xl bg-orange-50 border border-orange-200 px-3 py-1 text-sm text-orange-600 font-bold">
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
        <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-3">Morning</p>
        <ol className="space-y-2">
          {PROFILE.skincare.morning.map((step, i) => (
            <li key={step} className="flex gap-3 text-sm text-stone-700">
              <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </Card>

      <Card>
        <p className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-3">Night</p>
        <ol className="space-y-2">
          {PROFILE.skincare.night.map((step, i) => (
            <li key={step} className="flex gap-3 text-sm text-stone-700">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </Card>

      <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
        <p className="text-xs font-bold text-red-500 uppercase tracking-widest mb-1">Key Rule</p>
        <p className="text-sm text-stone-700">{PROFILE.skincare.keyRule}</p>
      </div>

      <Card>
        <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Recommended Brands</p>
        <div className="flex flex-wrap gap-2">
          {PROFILE.skincare.brands.map(b => (
            <span key={b} className="rounded-lg bg-stone-100 border border-stone-200 px-3 py-1 text-xs text-stone-600 font-medium">
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
      <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4">
        <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-1">Status</p>
        <p className="text-sm text-stone-700">Norwood 2–3 — <span className="text-orange-600 font-bold">intervention window is still good.</span> Act now.</p>
      </div>

      {PROFILE.hair.map(h => (
        <div key={h.treatment} className="rounded-2xl border border-stone-200 bg-white shadow-sm p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-stone-900 font-bold">{h.treatment}</p>
              <p className="text-xs text-stone-400 mt-0.5">{h.product}</p>
            </div>
            <span className="rounded-xl bg-stone-100 border border-stone-200 px-2.5 py-1 text-xs text-stone-600 font-semibold">
              {h.frequency}
            </span>
          </div>
        </div>
      ))}

      <div className="rounded-2xl border border-stone-200 bg-white shadow-sm p-4">
        <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Best Hairstyle Now</p>
        <p className="text-sm text-stone-700">Short textured crop — sides faded, top 1.5–2 inches, matte clay styling</p>
      </div>
    </div>
  )
}
