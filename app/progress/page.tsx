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
        <h1 className="text-2xl font-bold text-white">Progress</h1>
        <p className="text-neutral-500 text-sm mt-0.5">90-day milestone tracker</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: 'Start',   value: `${startW} kg`,  sub: '17.5% BF' },
          { label: 'Target',  value: `${targetW} kg`, sub: '12.5% BF' },
          { label: 'To lose', value: `${totalDrop} kg`, sub: 'pure fat' },
        ].map(({ label, value, sub }) => (
          <div key={label} className="rounded-xl border border-[#262626] bg-[#141414] p-3 text-center">
            <p className="text-[10px] text-neutral-500 uppercase tracking-wider">{label}</p>
            <p className="text-lg font-bold text-amber-400 mt-1">{value}</p>
            <p className="text-[10px] text-neutral-600 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* Week-by-week table */}
      <div className="rounded-xl border border-[#262626] bg-[#141414] overflow-hidden">
        <div className="grid grid-cols-4 text-[10px] uppercase tracking-widest text-neutral-500 px-4 py-2.5 border-b border-[#262626]">
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
              className={`grid grid-cols-4 items-center px-4 py-3 border-b border-[#1e1e1e] last:border-0 ${
                isCurrentWeek ? 'bg-amber-900/10' : ''
              }`}
            >
              <div className="flex items-center gap-2">
                {isCurrentWeek && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />}
                <span className={`text-sm font-medium ${isCurrentWeek ? 'text-amber-400' : isPast ? 'text-neutral-300' : 'text-neutral-600'}`}>
                  W{m.week}
                </span>
              </div>

              <p className={`text-sm text-center ${isPast || isCurrentWeek ? 'text-neutral-400' : 'text-neutral-700'}`}>
                {m.weight} kg
              </p>

              <p className="text-sm text-center">
                {actual != null ? (
                  <span className={diff! > 0.3 ? 'text-red-400' : diff! < -0.3 ? 'text-green-400' : 'text-neutral-300'}>
                    {actual} kg
                  </span>
                ) : (
                  <span className="text-neutral-700">—</span>
                )}
              </p>

              <p className={`text-[11px] text-right ${isPast || isCurrentWeek ? 'text-neutral-500' : 'text-neutral-700'}`}>
                {m.note}
              </p>
            </div>
          )
        })}
      </div>

      {/* Rating tracker */}
      <div className="mt-5 rounded-xl border border-[#262626] bg-[#141414] p-4">
        <p className="text-xs text-neutral-500 uppercase tracking-widest mb-3">Overall Rating</p>
        <div className="space-y-2.5">
          {[
            { label: 'Physical Features', now: 5.5, goal: 7 },
            { label: 'Grooming',          now: 5,   goal: 7.5 },
            { label: 'Skin',              now: 4.5, goal: 7 },
            { label: 'Expression / Vibe', now: 4,   goal: 7 },
          ].map(({ label, now, goal }) => (
            <div key={label}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-neutral-400">{label}</span>
                <span className="text-neutral-500">
                  <span className="text-amber-400 font-medium">{now}</span>
                  <span className="text-neutral-700"> → {goal}/10</span>
                </span>
              </div>
              <div className="relative h-1.5 rounded-full bg-[#262626] overflow-hidden">
                <div className="absolute h-full rounded-full bg-neutral-700" style={{ width: `${goal * 10}%` }} />
                <div className="absolute h-full rounded-full bg-amber-500" style={{ width: `${now * 10}%` }} />
              </div>
            </div>
          ))}
        </div>
        <p className="text-center text-xs text-neutral-600 mt-3">
          5/10 → <span className="text-amber-400 font-semibold">7.5/10</span> in 90 days
        </p>
      </div>
    </div>
  )
}
