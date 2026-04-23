'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { PROFILE } from '@/lib/profile'
import { getLog, type DailyLog } from '@/lib/supabase'

const START = new Date('2026-04-24')

function getDayNumber(): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const start = new Date(START)
  start.setHours(0, 0, 0, 0)
  return Math.min(Math.max(Math.floor((today.getTime() - start.getTime()) / 86400000) + 1, 1), 90)
}

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

function getTodayWorkout() {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const name = days[new Date().getDay()]
  return PROFILE.gymSplit.find(g => g.day === name) ?? PROFILE.gymSplit[6]
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

type Macro = { label: string; value: number | null; target: number; unit: string; color: string }

function MacroBar({ label, value, target, unit, color }: Macro) {
  const pct = value ? Math.min((value / target) * 100, 100) : 0
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-stone-500">{label}</span>
        <span className={value ? 'text-stone-800 font-medium' : 'text-stone-300'}>
          {value ?? '—'}<span className="text-stone-400 font-normal">/{target}{unit}</span>
        </span>
      </div>
      <div className="h-2 rounded-full bg-stone-100 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  )
}

export default function Dashboard() {
  const day = getDayNumber()
  const pct = Math.round((day / 90) * 100)
  const workout = getTodayWorkout()
  const [log, setLog] = useState<DailyLog | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    getLog(todayISO()).then(d => { setLog(d); setLoaded(true) })
  }, [])

  const macros: Macro[] = [
    { label: 'Calories', value: log?.calories_kcal ?? null, target: PROFILE.dailyTargets.calories, unit: ' kcal', color: '#f97316' },
    { label: 'Protein',  value: log?.protein_g ?? null,     target: PROFILE.dailyTargets.protein,  unit: 'g',     color: '#22c55e' },
    { label: 'Water',    value: log ? Math.round((log.water_ml ?? 0) / 100) / 10 : null, target: 3.5, unit: 'L', color: '#38bdf8' },
  ]

  return (
    <div className="px-4 pt-6 space-y-5">
      {/* Hero header */}
      <div className="rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 p-5 text-white shadow-lg shadow-orange-200">
        <p className="text-orange-100 text-sm font-medium">{getGreeting()},</p>
        <h1 className="text-3xl font-extrabold mt-0.5">Durgesh 💪</h1>
        <div className="flex items-end justify-between mt-3">
          <div>
            <p className="text-orange-100 text-xs uppercase tracking-widest">Day</p>
            <p className="text-5xl font-black leading-none">{day}<span className="text-xl font-semibold text-orange-200">/90</span></p>
          </div>
          <div className="text-right">
            <p className="text-orange-100 text-xs mb-1">{pct}% complete</p>
            <div className="w-32 h-2 rounded-full bg-orange-400/40 overflow-hidden">
              <div
                className="h-full rounded-full bg-white transition-all duration-700"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Today's workout */}
      <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
        <p className="text-xs text-stone-400 uppercase tracking-widest mb-2">Today's Session</p>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-stone-900 font-semibold text-base">{workout.focus}</p>
            {workout.cardio && <p className="text-orange-500 text-xs mt-0.5">{workout.cardio}</p>}
          </div>
          {loaded && (
            <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
              log?.gym_done
                ? 'bg-green-100 text-green-700 border border-green-200'
                : 'bg-stone-100 text-stone-400 border border-stone-200'
            }`}>
              {log?.gym_done ? 'Done ✓' : 'Not logged'}
            </span>
          )}
        </div>
      </div>

      {/* Macros */}
      <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs text-stone-400 uppercase tracking-widest">Today's Nutrition</p>
          {log?.weight_kg && (
            <span className="text-sm font-bold text-orange-500">{log.weight_kg} kg</span>
          )}
        </div>
        {macros.map(m => <MacroBar key={m.label} {...m} />)}
      </div>

      {/* Checklist */}
      <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
        <p className="text-xs text-stone-400 uppercase tracking-widest mb-3">Daily Checklist</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: 'Skincare AM',  done: log?.skincare_am ?? false },
            { label: 'Skincare PM',  done: log?.skincare_pm ?? false },
            { label: 'Minoxidil',    done: log?.minoxidil ?? false },
            { label: `${(log?.steps ?? 0).toLocaleString()} steps`, done: (log?.steps ?? 0) >= PROFILE.dailyTargets.steps },
          ].map(({ label, done }) => (
            <div key={label} className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium border transition-colors ${
              done
                ? 'bg-green-50 text-green-700 border-green-200'
                : 'bg-stone-50 text-stone-400 border-stone-200'
            }`}>
              <span>{done ? '✓' : '○'}</span>
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3 pb-2">
        <Link href="/log" className="flex flex-col items-center gap-2 rounded-2xl border-2 border-orange-200 bg-orange-50 p-4 text-center hover:bg-orange-100 transition-colors">
          <span className="text-2xl">📝</span>
          <span className="text-sm font-semibold text-orange-600">Log Today</span>
        </Link>
        <Link href="/chat" className="flex flex-col items-center gap-2 rounded-2xl border border-stone-200 bg-white p-4 text-center hover:bg-stone-50 transition-colors shadow-sm">
          <span className="text-2xl">💬</span>
          <span className="text-sm font-semibold text-stone-700">Ask Coach</span>
        </Link>
      </div>
    </div>
  )
}
