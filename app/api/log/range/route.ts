import { cookies } from 'next/headers'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

async function isAuthed(): Promise<boolean> {
  const jar = await cookies()
  return jar.get('tc_auth')?.value === process.env.APP_PASSWORD
}

// GET /api/log/range?from=YYYY-MM-DD&to=YYYY-MM-DD
export async function GET(req: Request) {
  if (!await isAuthed()) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const url = new URL(req.url)
  const from = url.searchParams.get('from')
  const to = url.searchParams.get('to')
  if (!from || !to) return Response.json({ error: 'from and to required' }, { status: 400 })

  const { data, error } = await getSupabaseAdmin()
    .from('daily_logs')
    .select('*')
    .gte('date', from)
    .lte('date', to)
    .order('date', { ascending: true })

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data ?? [])
}
