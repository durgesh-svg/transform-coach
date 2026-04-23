import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey)

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null

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

export async function upsertLog(log: Omit<DailyLog, 'id' | 'created_at' | 'updated_at'>) {
  if (!supabase) throw new Error('Supabase not configured')
  const { data, error } = await supabase
    .from('daily_logs')
    .upsert({ ...log, updated_at: new Date().toISOString() }, { onConflict: 'date' })
    .select()
    .single()
  if (error) throw error
  return data as DailyLog
}

export async function getLog(date: string): Promise<DailyLog | null> {
  if (!supabase) return null
  const { data } = await supabase
    .from('daily_logs')
    .select('*')
    .eq('date', date)
    .maybeSingle()
  return data as DailyLog | null
}

export async function getLogs(from: string, to: string): Promise<DailyLog[]> {
  if (!supabase) return []
  const { data } = await supabase
    .from('daily_logs')
    .select('*')
    .gte('date', from)
    .lte('date', to)
    .order('date', { ascending: true })
  return (data ?? []) as DailyLog[]
}
