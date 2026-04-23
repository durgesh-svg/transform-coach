'use client'

import { useState, useEffect, useRef } from 'react'
import { upsertLog, getLog, isSupabaseConfigured, type DailyLog } from '@/lib/supabase'
import { PROFILE } from '@/lib/profile'

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

// ─── Food Logger types ────────────────────────────────────────────────────────

type FoodItem = {
  id: string
  description: string
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
}

// ─── Reusable small components ────────────────────────────────────────────────

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-stone-700 mb-1">{label}</label>
      {hint && <p className="text-xs text-stone-400 mb-1.5">{hint}</p>}
      {children}
    </div>
  )
}

function NumberInput({ value, onChange, placeholder, min, max }: {
  value: number | null; onChange: (v: number | null) => void; placeholder: string; min?: number; max?: number
}) {
  return (
    <input
      type="number"
      inputMode="decimal"
      value={value ?? ''}
      placeholder={placeholder}
      min={min}
      max={max}
      onChange={e => onChange(e.target.value === '' ? null : Number(e.target.value))}
      className="w-full rounded-xl bg-stone-50 border border-stone-200 px-3 py-2.5 text-stone-900 placeholder-stone-300 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
    />
  )
}

function Toggle({ label, icon, value, onChange }: {
  label: string; icon: string; value: boolean; onChange: (v: boolean) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold border transition-all ${
        value
          ? 'bg-green-50 border-green-300 text-green-700 shadow-sm'
          : 'bg-stone-50 border-stone-200 text-stone-500 hover:border-stone-300'
      }`}
    >
      <span>{icon}</span>
      <span>{label}</span>
      {value && <span className="ml-auto text-green-600">✓</span>}
    </button>
  )
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm space-y-4">
      <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">{title}</p>
      {children}
    </section>
  )
}

// ─── Food Logger section ──────────────────────────────────────────────────────

function FoodLogger({
  items,
  onAdd,
  onRemove,
}: {
  items: FoodItem[]
  onAdd: (item: FoodItem) => void
  onRemove: (id: string) => void
}) {
  const [text, setText] = useState('')
  const [error, setError] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function analyzeText() {
    if (!text.trim() || analyzing) return
    setError(''); setAnalyzing(true)
    try {
      const res = await fetch('/api/analyze-food', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'text', content: text.trim() }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Analysis failed'); return }
      onAdd({ id: crypto.randomUUID(), ...data })
      setText('')
    } finally { setAnalyzing(false) }
  }

  async function analyzeImage(file: File) {
    setError(''); setAnalyzing(true)
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve((reader.result as string).split(',')[1])
        reader.onerror = reject
        reader.readAsDataURL(file)
      })
      const res = await fetch('/api/analyze-food', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'image', content: base64, mimeType: file.type }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Analysis failed'); return }
      onAdd({ id: crypto.randomUUID(), ...data })
    } finally { setAnalyzing(false) }
  }

  const totals = items.reduce(
    (acc, i) => ({ cal: acc.cal + i.calories, pro: acc.pro + i.protein_g }),
    { cal: 0, pro: 0 }
  )

  return (
    <section className="rounded-2xl border border-orange-200 bg-orange-50 p-4 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-orange-600 uppercase tracking-widest">Food Log</p>
        {items.length > 0 && (
          <span className="text-xs text-orange-500 font-semibold">
            {totals.cal} kcal · {totals.pro}g protein
          </span>
        )}
      </div>

      {/* Text input row */}
      <div className="flex gap-2">
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); analyzeText() } }}
          placeholder="e.g. 150g chicken, 2 chapati, dal, salad…"
          rows={2}
          disabled={analyzing}
          className="flex-1 rounded-xl bg-white border border-orange-200 px-3 py-2 text-sm text-stone-800 placeholder-stone-300 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all resize-none"
        />
        <div className="flex flex-col gap-2">
          {/* Analyze text */}
          <button
            type="button"
            onClick={analyzeText}
            disabled={!text.trim() || analyzing}
            className="flex-1 px-3 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:bg-orange-200 text-white text-xs font-bold transition-all"
          >
            {analyzing ? '…' : 'Analyze'}
          </button>
          {/* Photo upload */}
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={analyzing}
            title="Upload food photo"
            className="flex-1 flex items-center justify-center rounded-xl bg-white border border-orange-200 hover:bg-orange-50 disabled:opacity-50 transition-all"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21,15 16,10 5,21" />
            </svg>
          </button>
        </div>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) analyzeImage(f); e.target.value = '' }}
      />

      {error && (
        <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
      )}

      {/* Food item chips */}
      {items.length > 0 && (
        <div className="space-y-2">
          {items.map(item => (
            <div key={item.id} className="flex items-center justify-between rounded-xl bg-white border border-orange-100 px-3 py-2.5 shadow-sm">
              <div>
                <p className="text-sm font-semibold text-stone-800">{item.description}</p>
                <p className="text-xs text-stone-400 mt-0.5">
                  {item.calories} kcal · {item.protein_g}g protein · {item.carbs_g}g carbs · {item.fat_g}g fat
                </p>
              </div>
              <button
                type="button"
                onClick={() => onRemove(item.id)}
                className="w-6 h-6 rounded-full bg-stone-100 hover:bg-red-100 text-stone-400 hover:text-red-500 flex items-center justify-center text-sm transition-colors ml-3 shrink-0"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {items.length === 0 && (
        <p className="text-xs text-orange-400 text-center py-1">
          Type a meal or snap a photo — macros auto-fill below
        </p>
      )}
    </section>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function LogPage() {
  const [form, setForm] = useState({ ...EMPTY, date: todayISO() })
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [foodItems, setFoodItems] = useState<FoodItem[]>([])

  useEffect(() => {
    getLog(form.date).then(existing => {
      if (existing) setForm({ ...EMPTY, ...existing })
      else setForm({ ...EMPTY, date: form.date })
      setFoodItems([])
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.date])

  // Auto-fill calories + protein from food items
  useEffect(() => {
    if (foodItems.length === 0) return
    const cal = foodItems.reduce((s, i) => s + i.calories, 0)
    const pro = foodItems.reduce((s, i) => s + i.protein_g, 0)
    setForm(f => ({ ...f, calories_kcal: cal, protein_g: pro }))
  }, [foodItems])

  function set<K extends keyof typeof form>(key: K, val: (typeof form)[K]) {
    setForm(f => ({ ...f, [key]: val }))
  }

  function handleAnalyzeAndAdd(item: FoodItem) {
    setFoodItems(prev => [...prev, item])
  }

  async function save() {
    if (!isSupabaseConfigured) {
      setStatus('error')
      setErrorMsg('Supabase not configured. Add env vars to .env.local')
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
  const fromFoodLog = foodItems.length > 0

  return (
    <div className="px-4 pt-6 pb-2">
      <div className="mb-5">
        <h1 className="text-2xl font-extrabold text-stone-900">Daily Log</h1>
        <p className="text-stone-500 text-sm mt-0.5">Track your progress every day</p>
      </div>

      {/* Date picker */}
      <div className="mb-5">
        <Field label="Date">
          <input
            type="date"
            value={form.date}
            max={todayISO()}
            onChange={e => set('date', e.target.value)}
            className="w-full rounded-xl bg-stone-50 border border-stone-200 px-3 py-2.5 text-stone-900 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
          />
        </Field>
      </div>

      <div className="space-y-4">
        {/* Body */}
        <SectionCard title="Body">
          <Field label="Weight (kg)" hint={`Target: ${PROFILE.body.targetWeight} kg`}>
            <NumberInput value={form.weight_kg} onChange={v => set('weight_kg', v)} placeholder="72.0" min={40} max={200} />
          </Field>
        </SectionCard>

        {/* Food Logger */}
        <FoodLogger
          items={foodItems}
          onAdd={handleAnalyzeAndAdd}
          onRemove={id => setFoodItems(prev => prev.filter(i => i.id !== id))}
        />

        {/* Nutrition */}
        <SectionCard title="Nutrition">
          <Field
            label="Calories (kcal)"
            hint={fromFoodLog ? `Auto-filled from food log · target ${PROFILE.dailyTargets.calories} kcal` : `Target: ${PROFILE.dailyTargets.calories} kcal`}
          >
            <div className="relative">
              <NumberInput value={form.calories_kcal} onChange={v => set('calories_kcal', v)} placeholder="1950" />
              {fromFoodLog && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-orange-400 font-semibold pointer-events-none">auto</span>
              )}
            </div>
          </Field>
          <Field
            label="Protein (g)"
            hint={fromFoodLog ? `Auto-filled from food log · target ${PROFILE.dailyTargets.protein}g` : `Target: ${PROFILE.dailyTargets.protein}g`}
          >
            <div className="relative">
              <NumberInput value={form.protein_g} onChange={v => set('protein_g', v)} placeholder="160" />
              {fromFoodLog && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-orange-400 font-semibold pointer-events-none">auto</span>
              )}
            </div>
          </Field>
          <Field label="Water (ml)" hint={waterL ? `${waterL}L of 3.5L` : 'Target: 3500 ml'}>
            <NumberInput value={form.water_ml} onChange={v => set('water_ml', v)} placeholder="3500" />
          </Field>
          <Field label="Steps" hint={`Target: ${PROFILE.dailyTargets.steps.toLocaleString()}`}>
            <NumberInput value={form.steps} onChange={v => set('steps', v)} placeholder="8000" />
          </Field>
        </SectionCard>

        {/* Gym */}
        <SectionCard title="Gym">
          <Toggle label="Gym Done" icon="🏋️" value={form.gym_done} onChange={v => set('gym_done', v)} />
          {form.gym_done && (
            <Field label="Notes (optional)">
              <textarea
                value={form.gym_notes}
                onChange={e => set('gym_notes', e.target.value)}
                rows={2}
                placeholder="e.g. PR on bench, skipped HIIT..."
                className="w-full rounded-xl bg-stone-50 border border-stone-200 px-3 py-2.5 text-stone-900 placeholder-stone-300 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all resize-none text-sm"
              />
            </Field>
          )}
        </SectionCard>

        {/* Routines */}
        <SectionCard title="Routines">
          <Toggle label="Skincare — Morning" icon="☀️" value={form.skincare_am} onChange={v => set('skincare_am', v)} />
          <Toggle label="Skincare — Night"   icon="🌙" value={form.skincare_pm} onChange={v => set('skincare_pm', v)} />
          <Toggle label="Minoxidil"           icon="💊" value={form.minoxidil}  onChange={v => set('minoxidil', v)} />
        </SectionCard>

        {/* Save */}
        <button
          onClick={save}
          disabled={status === 'saving'}
          className={`w-full rounded-2xl py-4 font-bold text-base transition-all shadow-md ${
            status === 'saved'
              ? 'bg-green-500 text-white shadow-green-200'
              : status === 'saving'
              ? 'bg-orange-300 text-white cursor-wait'
              : 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-200 active:scale-[0.98]'
          }`}
        >
          {status === 'saving' ? 'Saving...' : status === 'saved' ? 'Saved ✓' : 'Save Log'}
        </button>

        {status === 'error' && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-red-600 text-sm">
            {errorMsg}
          </div>
        )}
      </div>
    </div>
  )
}
