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
        <span className="text-neutral-400">{label}</span>
        <span className={value ? 'text-neutral-200' : 'text-neutral-600'}>
          {value ?? '—'}<span className="text-neutral-500">/{target}{unit}</span>
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-[#262626] overflow-hidden">
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
    { label: 'Calories', value: log?.calories_kcal ?? null, target: PROFILE.dailyTargets.calories, unit: ' kcal', color: '#f59e0b' },
    { label: 'Protein',  value: log?.protein_g ?? null,     target: PROFILE.dailyTargets.protein,  unit: 'g',     color: '#22c55e' },
    { label: 'Water',    value: log ? Math.round((log.water_ml ?? 0) / 100) / 10 : null, target: 3.5, unit: 'L', color: '#38bdf8' },
  ]

  return (
    <div className="px-4 pt-6 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-neutral-400 text-sm">{getGreeting()},</p>
          <h1 className="text-2xl font-bold text-white">Durgesh</h1>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-amber-400">{day}</p>
          <p className="text-neutral-500 text-xs">of 90 days</p>
        </div>
      </div>

      {/* 90-day progress bar */}
      <div>
        <div className="flex justify-between text-xs text-neutral-500 mb-2">
          <span>Day 1</span>
          <span className="text-amber-400 font-medium">{pct}% complete</span>
          <span>Day 90</span>
        </div>
        <div className="h-2 rounded-full bg-[#1f1f1f] overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-600 to-amber-400 transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Today's workout */}
      <div className="rounded-xl border border-[#262626] bg-[#141414] p-4">
        <p className="text-xs text-neutral-500 uppercase tracking-widest mb-2">Today's Session</p>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white font-semibold">{workout.focus}</p>
            {workout.cardio && <p className="text-amber-400/70 text-xs mt-0.5">{workout.cardio}</p>}
          </div>
          {loaded && (
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
              log?.gym_done
                ? 'bg-green-900/40 text-green-400 border border-green-800'
                : 'bg-[#1f1f1f] text-neutral-500 border border-[#2a2a2a]'
            }`}>
              {log?.gym_done ? 'Done ✓' : 'Not logged'}
            </span>
          )}
        </div>
      </div>

      {/* Macros */}
      <div className="rounded-xl border border-[#262626] bg-[#141414] p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs text-neutral-500 uppercase tracking-widest">Today's Nutrition</p>
          {log?.weight_kg && (
            <span className="text-sm font-semibold text-amber-400">{log.weight_kg} kg</span>
          )}
        </div>
        {macros.map(m => <MacroBar key={m.label} {...m} />)}
      </div>

      {/* Checklist */}
      <div className="rounded-xl border border-[#262626] bg-[#141414] p-4">
        <p className="text-xs text-neutral-500 uppercase tracking-widest mb-3">Daily Checklist</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: 'Skincare AM',  done: log?.skincare_am ?? false },
            { label: 'Skincare PM',  done: log?.skincare_pm ?? false },
            { label: 'Minoxidil',    done: log?.minoxidil ?? false },
            { label: `${(log?.steps ?? 0).toLocaleString()} steps`, done: (log?.steps ?? 0) >= PROFILE.dailyTargets.steps },
          ].map(({ label, done }) => (
            <div key={label} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
              done ? 'bg-green-900/20 text-green-400' : 'bg-[#1a1a1a] text-neutral-500'
            }`}>
              <span className="text-base">{done ? '✓' : '○'}</span>
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3 pb-2">
        <Link href="/log" className="flex flex-col items-center gap-2 rounded-xl border border-amber-800/40 bg-amber-900/10 p-4 text-center hover:bg-amber-900/20 transition-colors">
          <span className="text-2xl">📝</span>
          <span className="text-sm font-medium text-amber-300">Log Today</span>
        </Link>
        <Link href="/chat" className="flex flex-col items-center gap-2 rounded-xl border border-[#262626] bg-[#141414] p-4 text-center hover:bg-[#1f1f1f] transition-colors">
          <span className="text-2xl">💬</span>
          <span className="text-sm font-medium text-neutral-300">Ask Coach</span>
        </Link>
      </div>
    </div>
  )
}
