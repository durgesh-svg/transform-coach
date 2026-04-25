import { cookies } from 'next/headers'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

async function isAuthed(): Promise<boolean> {
  const jar = await cookies()
  return jar.get('tc_auth')?.value === process.env.APP_PASSWORD
}

// GET /api/log?date=YYYY-MM-DD
export async function GET(req: Request) {
  if (!await isAuthed()) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const date = new URL(req.url).searchParams.get('date')
  if (!date) return Response.json({ error: 'date required' }, { status: 400 })

  const { data, error } = await getSupabaseAdmin()
    .from('daily_logs')
    .select('*')
    .eq('date', date)
    .maybeSingle()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data)
}

// POST /api/log — upsert a log entry
export async function POST(req: Request) {
  if (!await isAuthed()) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { data, error } = await getSupabaseAdmin()
    .from('daily_logs')
    .upsert({ ...body, updated_at: new Date().toISOString() }, { onConflict: 'date' })
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data)
}
