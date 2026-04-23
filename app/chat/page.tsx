'use client'

import { useState, useRef, useEffect } from 'react'

type Role = 'user' | 'assistant'
type Message = { role: Role; content: string }

const STARTERS = [
  "How do I break a weight plateau?",
  "Is my protein target right for fat loss?",
  "Best exercises for jawline definition?",
  "How long before minoxidil shows results?",
]

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streaming])

  async function send(text: string) {
    const userMessage = text.trim()
    if (!userMessage || streaming) return

    const newMessages: Message[] = [...messages, { role: 'user', content: userMessage }]
    setMessages(newMessages)
    setInput('')
    setStreaming(true)
    setMessages(m => [...m, { role: 'assistant', content: '' }])

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
        }),
      })

      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let full = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        full += decoder.decode(value, { stream: true })
        setMessages(m => {
          const copy = [...m]
          copy[copy.length - 1] = { role: 'assistant', content: full }
          return copy
        })
      }
    } catch (err) {
      setMessages(m => {
        const copy = [...m]
        copy[copy.length - 1] = {
          role: 'assistant',
          content: `Sorry, something went wrong. ${err instanceof Error ? err.message : ''}`,
        }
        return copy
      })
    } finally {
      setStreaming(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send(input)
    }
  }

  return (
    <div className="flex flex-col h-screen max-h-screen bg-[#f7f4f0]">
      {/* Header */}
      <div className="px-4 pt-6 pb-3 border-b border-stone-200 bg-white shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-lg shadow-md shadow-orange-200">
            🏆
          </div>
          <div>
            <h1 className="text-stone-900 font-bold text-base">Transform Coach</h1>
            <p className="text-xs text-stone-400">Knows your full 90-day plan</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-stone-400">Online</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="pt-4 space-y-5">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-3xl mx-auto mb-3 shadow-lg shadow-orange-200">
                💪
              </div>
              <p className="text-stone-900 font-bold text-lg">Hey Durgesh.</p>
              <p className="text-stone-500 text-sm mt-1">I know your full plan. Ask me anything.</p>
            </div>
            <div className="space-y-2">
              {STARTERS.map(s => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="w-full text-left rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-700 font-medium hover:border-orange-200 hover:bg-orange-50 transition-all shadow-sm"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-sm mr-2 mt-1 shrink-0 shadow-sm shadow-orange-200">
                🏆
              </div>
            )}
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed prose-chat ${
                m.role === 'user'
                  ? 'bg-orange-500 text-white rounded-tr-sm font-medium shadow-md shadow-orange-200'
                  : 'bg-white text-stone-800 rounded-tl-sm border border-stone-200 shadow-sm'
              }`}
            >
              {m.content || (
                <span className="inline-flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 bg-stone-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-stone-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-stone-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-stone-200 bg-white shrink-0 pb-24">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask your coach..."
            rows={1}
            disabled={streaming}
            className="flex-1 rounded-2xl bg-stone-50 border border-stone-200 px-3 py-2.5 text-stone-900 placeholder-stone-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all resize-none text-sm"
            style={{ minHeight: '42px', maxHeight: '120px' }}
            onInput={e => {
              const t = e.currentTarget
              t.style.height = 'auto'
              t.style.height = `${Math.min(t.scrollHeight, 120)}px`
            }}
          />
          <button
            onClick={() => send(input)}
            disabled={!input.trim() || streaming}
            className="w-10 h-10 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:bg-stone-200 disabled:text-stone-400 text-white flex items-center justify-center transition-all shadow-md shadow-orange-200 disabled:shadow-none active:scale-95"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
          </button>
        </div>
        <p className="text-[10px] text-stone-400 mt-1.5 text-center">Enter to send · Shift+Enter for newline</p>
      </div>
    </div>
  )
}
