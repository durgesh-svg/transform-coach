// Shared types used by both client components and server routes

export type DailyLog = {
  id?: string
  date: string
  weight_kg: number | null
  calories_kcal: number | null
  protein_g: number | null
  water_ml: number | null
  steps: number | null
  gym_done: boolean
  gym_notes: string
  skincare_am: boolean
  skincare_pm: boolean
  minoxidil: boolean
  created_at?: string
  updated_at?: string
}

// Client-side helpers — all calls go through /api/log (server-side, auth-checked)

export async function getLog(date: string): Promise<DailyLog | null> {
  const res = await fetch(`/api/log?date=${date}`)
  if (!res.ok) return null
  return res.json()
}

export async function upsertLog(log: Omit<DailyLog, 'id' | 'created_at' | 'updated_at'>): Promise<DailyLog> {
  const res = await fetch('/api/log', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(log),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(err.error ?? 'Save failed')
  }
  return res.json()
}

export async function getLogs(from: string, to: string): Promise<DailyLog[]> {
  const res = await fetch(`/api/log/range?from=${from}&to=${to}`)
  if (!res.ok) return []
  return res.json()
}

// Legacy export kept so existing imports don't break
export const isSupabaseConfigured = true
