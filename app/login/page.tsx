'use client'

import { useState } from 'react'

export default function LoginPage() {
  const [pw, setPw] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pw }),
      })
      if (res.ok) {
        window.location.href = '/'
      } else {
        const d = await res.json()
        setError(d.error ?? 'Wrong password')
        setPw('')
      }
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-[#f7f4f0] flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg shadow-orange-200">
            💪
          </div>
          <h1 className="text-2xl font-extrabold text-stone-900">Transform Coach</h1>
          <p className="text-stone-500 text-sm mt-1">Your personal space. Private.</p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <input
              type="password"
              value={pw}
              onChange={e => { setPw(e.target.value); setError('') }}
              placeholder="Enter your password"
              autoFocus
              className="w-full rounded-2xl bg-white border border-stone-200 px-4 py-3.5 text-stone-900 placeholder-stone-400 text-center text-lg tracking-widest focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all shadow-sm"
            />
          </div>

          {error && (
            <p className="text-center text-sm text-red-500 bg-red-50 border border-red-200 rounded-xl py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={!pw || loading}
            className="w-full rounded-2xl bg-orange-500 hover:bg-orange-600 disabled:bg-orange-200 text-white font-bold py-3.5 text-base transition-all shadow-md shadow-orange-200 active:scale-[0.98]"
          >
            {loading ? 'Checking…' : 'Enter'}
          </button>
        </form>

        <p className="text-center text-xs text-stone-400 mt-6">
          Only you have access to this app.
        </p>
      </div>
    </div>
  )
}
