import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { password } = await req.json()
  const correct = process.env.APP_PASSWORD

  if (!correct) {
    return NextResponse.json({ error: 'APP_PASSWORD not set on server.' }, { status: 500 })
  }

  if (password !== correct) {
    return NextResponse.json({ error: 'Wrong password.' }, { status: 401 })
  }

  const res = NextResponse.json({ ok: true })
  res.cookies.set('tc_auth', correct, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
  })
  return res
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true })
  res.cookies.delete('tc_auth')
  return res
}
