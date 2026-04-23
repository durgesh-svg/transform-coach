'use client'

import { useState, useEffect } from 'react'
import { upsertLog, getLog, type DailyLog } from '@/lib/supabase'
import { PROFILE } from '@/lib/profile'
import { isSupabaseConfigured } from '@/lib/supabase'

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

const EMPTY: Omit<DailyLog, 'id' | 'created_at' | 'updated_at'> = {
  date: todayISO(),
  weight_kg: null,
  calories_kcal: null,
  protein_g: null,
  water_ml: null,
  steps: null,
  gym_done: false,
  gym_notes: '',
  skincare_am: false,
  skincare_pm: false,
  minoxidil: false,
}

function Field({
  label, hint, children,
}: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-neutral-300 mb-1">{label}</label>
      {hint && <p className="text-xs text-neutral-600 mb-1.5">{hint}</p>}
      {children}
    </div>
  )
}

function NumberInput({
  value, onChange, placeholder, min, max,
}: { value: number | null; onChange: (v: number | null) => void; placeholder: string; min?: number; max?: number }) {
  return (
    <input
      type="number"
      inputMode="decimal"
      value={value ?? ''}
      placeholder={placeholder}
      min={min}
      max={max}
      onChange={e => onChange(e.target.value === '' ? null : Number(e.target.value))}
      className="w-full rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] px-3 py-2.5 text-white placeholder-neutral-600 focus:outline-none focus:border-amber-600 transition-colors"
    />
  )
}

function Toggle({
  label, icon, value, onChange,
}: { label: string; icon: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium border transition-colors ${
        value
          ? 'bg-green-900/30 border-green-700/50 text-green-400'
          : 'bg-[#1a1a1a] border-[#2a2a2a] text-neutral-500'
      }`}
    >
      <span>{icon}</span>
      <span>{label}</span>
      {value && <span className="ml-auto">✓</span>}
    </button>
  )
}

export default function LogPage() {
  const [form, setForm] = useState({ ...EMPTY, date: todayISO() })
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    getLog(form.date).then(existing => {
      if (existing) {
        setForm({ ...EMPTY, ...existing })
      } else {
        setForm({ ...EMPTY, date: form.date })
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.date])

  function set<K extends keyof typeof form>(key: K, val: (typeof form)[K]) {
    setForm(f => ({ ...f, [key]: val }))
  }

  async function save() {
    if (!isSupabaseConfigured) {
      setStatus('error')
      setErrorMsg('Supabase not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local')
      return
    }
    setStatus('saving')
    try {
      await upsertLog(form)
      setStatus('saved')
      setTimeout(() => setStatus('idle'), 2500)
    } catch (e) {
      setStatus('error')
      setErrorMsg(e instanceof Error ? e.message : 'Save failed')
    }
  }

  const waterL = form.water_ml ? (form.water_ml / 1000).toFixed(1) : null

  return (
    <div className="px-4 pt-6 pb-2">
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-white">Daily Log</h1>
        <p className="text-neutral-500 text-sm mt-0.5">Track your progress every day</p>
      </div>

      {/* Date picker */}
      <div className="mb-5">
        <Field label="Date">
          <input
            type="date"
            value={form.date}
            max={todayISO()}
            onChange={e => set('date', e.target.value)}
            className="w-full rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] px-3 py-2.5 text-white focus:outline-none focus:border-amber-600 transition-colors"
          />
        </Field>
      </div>

      <div className="space-y-5">
        {/* Body */}
        <section className="rounded-xl border border-[#262626] bg-[#141414] p-4 space-y-4">
          <p className="text-xs text-neutral-500 uppercase tracking-widest">Body</p>
          <Field label="Weight (kg)" hint={`Target: ${PROFILE.body.targetWeight} kg`}>
            <NumberInput value={form.weight_kg} onChange={v => set('weight_kg', v)} placeholder="72.0" min={40} max={200} />
          </Field>
        </section>

        {/* Nutrition */}
        <section className="rounded-xl border border-[#262626] bg-[#141414] p-4 space-y-4">
          <p className="text-xs text-neutral-500 uppercase tracking-widest">Nutrition</p>
          <Field label="Calories (kcal)" hint={`Target: ${PROFILE.dailyTargets.calories} kcal`}>
            <NumberInput value={form.calories_kcal} onChange={v => set('calories_kcal', v)} placeholder="1950" />
          </Field>
          <Field label="Protein (g)" hint={`Target: ${PROFILE.dailyTargets.protein}g`}>
            <NumberInput value={form.protein_g} onChange={v => set('protein_g', v)} placeholder="160" />
          </Field>
          <Field label="Water (ml)" hint={waterL ? `${waterL}L of 3.5L` : 'Target: 3500 ml'}>
            <NumberInput value={form.water_ml} onChange={v => set('water_ml', v)} placeholder="3500" />
          </Field>
          <Field label="Steps" hint={`Target: ${PROFILE.dailyTargets.steps.toLocaleString()}`}>
            <NumberInput value={form.steps} onChange={v => set('steps', v)} placeholder="8000" />
          </Field>
        </section>

        {/* Gym */}
        <section className="rounded-xl border border-[#262626] bg-[#141414] p-4 space-y-4">
          <p className="text-xs text-neutral-500 uppercase tracking-widest">Gym</p>
          <Toggle label="Gym Done" icon="🏋️" value={form.gym_done} onChange={v => set('gym_done', v)} />
          {form.gym_done && (
            <Field label="Notes (optional)">
              <textarea
                value={form.gym_notes}
                onChange={e => set('gym_notes', e.target.value)}
                rows={2}
                placeholder="e.g. PR on bench, skipped HIIT..."
                className="w-full rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] px-3 py-2.5 text-white placeholder-neutral-600 focus:outline-none focus:border-amber-600 transition-colors resize-none text-sm"
              />
            </Field>
          )}
        </section>

        {/* Routines */}
        <section className="rounded-xl border border-[#262626] bg-[#141414] p-4 space-y-3">
          <p className="text-xs text-neutral-500 uppercase tracking-widest">Routines</p>
          <div className="space-y-2">
            <Toggle label="Skincare — Morning" icon="☀️" value={form.skincare_am} onChange={v => set('skincare_am', v)} />
            <Toggle label="Skincare — Night"   icon="🌙" value={form.skincare_pm} onChange={v => set('skincare_pm', v)} />
            <Toggle label="Minoxidil"           icon="💊" value={form.minoxidil}  onChange={v => set('minoxidil', v)} />
          </div>
        </section>

        {/* Save */}
        <button
          onClick={save}
          disabled={status === 'saving'}
          className={`w-full rounded-xl py-3.5 font-semibold text-base transition-all ${
            status === 'saved'
              ? 'bg-green-700 text-white'
              : status === 'saving'
              ? 'bg-amber-800/50 text-amber-400 cursor-wait'
              : 'bg-amber-500 hover:bg-amber-400 text-black'
          }`}
        >
          {status === 'saving' ? 'Saving...' : status === 'saved' ? 'Saved ✓' : 'Save Log'}
        </button>

        {status === 'error' && (
          <div className="rounded-lg bg-red-900/20 border border-red-800 p-3 text-red-400 text-sm">
            {errorMsg}
          </div>
        )}
      </div>
    </div>
  )
}
