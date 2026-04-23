'use client'

import { useEffect, useState } from 'react'
import { getLogs, type DailyLog } from '@/lib/supabase'
import { PROFILE } from '@/lib/profile'

const START = new Date('2026-04-24')

function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

function toISO(d: Date) {
  return d.toISOString().slice(0, 10)
}

function currentWeek(): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const start = new Date(START)
  start.setHours(0, 0, 0, 0)
  const daysDiff = Math.floor((today.getTime() - start.getTime()) / 86400000)
  return Math.min(Math.ceil((daysDiff + 1) / 7), 12)
}

function getWeightForWeek(logs: DailyLog[], week: number): number | null {
  const weekStart = toISO(addDays(START, (week - 1) * 7))
  const weekEnd = toISO(addDays(START, week * 7 - 1))
  const weekLogs = logs
    .filter(l => l.date >= weekStart && l.date <= weekEnd && l.weight_kg != null)
    .sort((a, b) => b.date.localeCompare(a.date))
  return weekLogs[0]?.weight_kg ?? null
}

export default function ProgressPage() {
  const [logs, setLogs] = useState<DailyLog[]>([])
  const cw = currentWeek()

  useEffect(() => {
    const end = toISO(addDays(START, 89))
    getLogs(toISO(START), end).then(setLogs)
  }, [])

  const startW = PROFILE.body.startWeight
  const targetW = PROFILE.body.targetWeight
  const totalDrop = startW - targetW

  return (
    <div className="px-4 pt-6 pb-2">
      <div className="mb-5">
        <h1 className="text-2xl font-extrabold text-stone-900">Progress</h1>
        <p className="text-stone-500 text-sm mt-0.5">90-day milestone tracker</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: 'Start',   value: `${startW} kg`,  sub: '17.5% BF', color: 'bg-stone-100 border-stone-200' },
          { label: 'Target',  value: `${targetW} kg`, sub: '12.5% BF', color: 'bg-orange-50 border-orange-200' },
          { label: 'To lose', value: `${totalDrop} kg`, sub: 'pure fat', color: 'bg-green-50 border-green-200' },
        ].map(({ label, value, sub, color }) => (
          <div key={label} className={`rounded-2xl border ${color} p-3 text-center`}>
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">{label}</p>
            <p className="text-lg font-extrabold text-orange-500 mt-1">{value}</p>
            <p className="text-[10px] text-stone-400 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* Week-by-week table */}
      <div className="rounded-2xl border border-stone-200 bg-white shadow-sm overflow-hidden mb-5">
        <div className="grid grid-cols-4 text-[10px] font-bold uppercase tracking-widest text-stone-400 px-4 py-2.5 border-b border-stone-100 bg-stone-50">
          <span>Week</span>
          <span className="text-center">Target</span>
          <span className="text-center">Actual</span>
          <span className="text-right">Note</span>
        </div>

        {PROFILE.milestones.map(m => {
          const actual = getWeightForWeek(logs, m.week)
          const isCurrentWeek = m.week === cw
          const isPast = m.week < cw
          const diff = actual != null ? +(actual - m.weight).toFixed(1) : null

          return (
            <div
              key={m.week}
              className={`grid grid-cols-4 items-center px-4 py-3 border-b border-stone-50 last:border-0 ${
                isCurrentWeek ? 'bg-orange-50' : ''
              }`}
            >
              <div className="flex items-center gap-2">
                {isCurrentWeek && <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0" />}
                <span className={`text-sm font-bold ${isCurrentWeek ? 'text-orange-500' : isPast ? 'text-stone-700' : 'text-stone-300'}`}>
                  W{m.week}
                </span>
              </div>

              <p className={`text-sm text-center ${isPast || isCurrentWeek ? 'text-stone-500' : 'text-stone-300'}`}>
                {m.weight} kg
              </p>

              <p className="text-sm text-center font-semibold">
                {actual != null ? (
                  <span className={diff! > 0.3 ? 'text-red-500' : diff! < -0.3 ? 'text-green-600' : 'text-stone-700'}>
                    {actual} kg
                  </span>
                ) : (
                  <span className="text-stone-300">—</span>
                )}
              </p>

              <p className={`text-[11px] text-right ${isPast || isCurrentWeek ? 'text-stone-400' : 'text-stone-300'}`}>
                {m.note}
              </p>
            </div>
          )
        })}
      </div>

      {/* Rating tracker */}
      <div className="rounded-2xl border border-stone-200 bg-white shadow-sm p-4">
        <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3">Overall Rating</p>
        <div className="space-y-3">
          {[
            { label: 'Physical Features', now: 5.5, goal: 7 },
            { label: 'Grooming',          now: 5,   goal: 7.5 },
            { label: 'Skin',              now: 4.5, goal: 7 },
            { label: 'Expression / Vibe', now: 4,   goal: 7 },
          ].map(({ label, now, goal }) => (
            <div key={label}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-stone-600 font-medium">{label}</span>
                <span className="text-stone-400">
                  <span className="text-orange-500 font-bold">{now}</span>
                  <span className="text-stone-300"> → {goal}/10</span>
                </span>
              </div>
              <div className="relative h-2 rounded-full bg-stone-100 overflow-hidden">
                <div className="absolute h-full rounded-full bg-orange-100" style={{ width: `${goal * 10}%` }} />
                <div className="absolute h-full rounded-full bg-orange-500" style={{ width: `${now * 10}%` }} />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-xl bg-orange-50 border border-orange-100 p-3 text-center">
          <p className="text-sm text-stone-600">
            <span className="text-stone-400">5/10</span>
            <span className="text-stone-400 mx-2">→</span>
            <span className="text-orange-500 font-extrabold text-lg">7.5/10</span>
            <span className="text-stone-400 ml-2 text-xs">in 90 days</span>
          </p>
        </div>
      </div>
    </div>
  )
}
