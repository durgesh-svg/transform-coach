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

    // add empty assistant message to stream into
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
    <div className="flex flex-col h-screen max-h-screen">
      {/* Header */}
      <div className="px-4 pt-6 pb-3 border-b border-[#1e1e1e] shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-amber-500/20 border border-amber-700/40 flex items-center justify-center text-lg">
            🏆
          </div>
          <div>
            <h1 className="text-white font-semibold text-base">Transform Coach</h1>
            <p className="text-xs text-neutral-500">Knows your full 90-day plan</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-neutral-500">Online</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="pt-4 space-y-5">
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-700/30 flex items-center justify-center text-3xl mx-auto mb-3">
                💪
              </div>
              <p className="text-white font-semibold">Hey Durgesh.</p>
              <p className="text-neutral-500 text-sm mt-1">I know your full plan. Ask me anything.</p>
            </div>
            <div className="space-y-2">
              {STARTERS.map(s => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="w-full text-left rounded-xl border border-[#262626] bg-[#141414] px-4 py-3 text-sm text-neutral-300 hover:border-amber-800/50 hover:bg-[#1a1a1a] transition-colors"
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
              <div className="w-7 h-7 rounded-full bg-amber-500/20 border border-amber-700/40 flex items-center justify-center text-sm mr-2 mt-1 shrink-0">
                🏆
              </div>
            )}
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed prose-chat ${
                m.role === 'user'
                  ? 'bg-amber-500 text-black rounded-tr-sm font-medium'
                  : 'bg-[#1a1a1a] text-neutral-200 rounded-tl-sm border border-[#262626]'
              }`}
            >
              {m.content || (
                <span className="inline-flex gap-1">
                  <span className="w-1.5 h-1.5 bg-neutral-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-neutral-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-neutral-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-[#1e1e1e] bg-[#0d0d0d] shrink-0 pb-24">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask your coach..."
            rows={1}
            disabled={streaming}
            className="flex-1 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] px-3 py-2.5 text-white placeholder-neutral-600 focus:outline-none focus:border-amber-700 transition-colors resize-none text-sm"
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
            className="w-10 h-10 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:bg-[#1f1f1f] disabled:text-neutral-600 text-black flex items-center justify-center transition-colors shrink-0"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
          </button>
        </div>
        <p className="text-[10px] text-neutral-700 mt-1.5 text-center">Enter to send · Shift+Enter for newline</p>
      </div>
    </div>
  )
}
