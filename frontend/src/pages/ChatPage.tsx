import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, RefreshCw, User } from 'lucide-react'
import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useTranslation } from 'react-i18next'

interface ChatMsg { id: string; role: 'user' | 'sophia'; content: string; streaming?: boolean }

function Bubble({ msg }: { msg: ChatMsg }) {
  const { t } = useTranslation()
  const isUser = msg.role === 'user'
  return (
    <motion.div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      {isUser ? (
        <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
             style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.2)' }}>
          <User className="w-3.5 h-3.5 text-primary-400" />
        </div>
      ) : (
        <div className="sophia-avatar w-7 h-7 text-xs shrink-0">S</div>
      )}
      <div className={`max-w-[78%] flex flex-col gap-1 ${isUser ? 'items-end' : ''}`}>
        <span className="text-2xs text-ink-muted">{isUser ? t('chat.you') : t('live.president')}</span>
        <div className="rounded-2xl px-4 py-2.5 text-sm leading-relaxed"
          style={isUser ? {
            background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', color: '#fff',
            borderRadius: '16px 4px 16px 16px',
          } : {
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
            color: '#e4e4e7', borderRadius: '4px 16px 16px 16px',
          }}>
          {msg.content}
          {msg.streaming && <span className="inline-block w-1.5 h-3.5 ml-1 rounded-sm bg-primary-400 animate-pulse" />}
        </div>
      </div>
    </motion.div>
  )
}

export default function ChatPage() {
  const { address, isConnected } = useAccount()
  const { t } = useTranslation()
  const [msgs, setMsgs]     = useState<ChatMsg[]>([])
  const [input, setInput]   = useState('')
  const [online, setOnline] = useState(false)
  const [sessionId]         = useState(() => `s-${Date.now()}-${Math.random().toString(36).slice(2)}`)
  const wsRef               = useRef<WebSocket | null>(null)
  const bottomRef           = useRef<HTMLDivElement>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [msgs])

  const connect = useCallback(() => {
    const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const port  = import.meta.env.DEV ? '8000' : window.location.port
    const ws    = new WebSocket(`${proto}//${window.location.hostname}:${port}/api/sophia/chat/${sessionId}`)
    wsRef.current = ws
    ws.onopen  = () => setOnline(true)
    ws.onclose = () => setOnline(false)
    ws.onmessage = (e) => {
      const d = JSON.parse(e.data)
      if (d.type === 'message')
        setMsgs(p => [...p, { id: Date.now().toString(), role: 'sophia', content: d.content }])
      else if (d.type === 'start')
        setMsgs(p => [...p, { id: `st-${Date.now()}`, role: 'sophia', content: '', streaming: true }])
      else if (d.type === 'chunk')
        setMsgs(p => { const l = p[p.length-1]; return l?.streaming ? [...p.slice(0,-1), {...l, content: l.content+d.content}] : p })
      else if (d.type === 'end')
        setMsgs(p => { const l = p[p.length-1]; return l?.streaming ? [...p.slice(0,-1), {...l, streaming: false}] : p })
    }
  }, [sessionId])

  useEffect(() => { connect(); return () => wsRef.current?.close() }, [connect])

  const send = (text: string) => {
    if (!text.trim() || !wsRef.current || wsRef.current.readyState !== 1) return
    setMsgs(p => [...p, { id: Date.now().toString(), role: 'user', content: text }])
    wsRef.current.send(JSON.stringify({ content: text, wallet_address: address ?? null }))
    setInput('')
  }

  const quickQ = t('chat.quick', { returnObjects: true }) as string[]

  if (!isConnected) return (
    <div className="mx-auto max-w-sm px-4 py-20 text-center">
      <div className="sophia-avatar w-14 h-14 text-xl mx-auto mb-4 animate-float">S</div>
      <h2 className="text-lg font-bold text-white mb-2">{t('chat.connect_title')}</h2>
      <p className="text-sm text-ink-muted mb-6">{t('chat.connect_desc')}</p>
      <ConnectButton />
      <button onClick={connect} className="btn-ghost mt-3 text-xs">{t('chat.skip_connect')}</button>
    </div>
  )

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 flex flex-col" style={{ height: 'calc(100vh - 56px)' }}>
      <motion.div className="flex items-center gap-3 mb-4 rounded-xl px-4 py-3"
        style={{ background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.18)' }}
        initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="sophia-avatar w-8 h-8 text-sm animate-float shrink-0">S</div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white">{t('live.president')}</span>
            <span className={`flex items-center gap-1 text-2xs font-medium ${online ? 'text-green-400' : 'text-ink-muted'}`}>
              {online ? <><span className="live-dot" />{t('chat.online')}</> : t('chat.connecting')}
            </span>
          </div>
          <p className="text-2xs text-ink-muted">{t('chat.subtitle')}</p>
        </div>
        <button onClick={() => { wsRef.current?.close(); setTimeout(connect, 500) }}
                className="btn-ghost text-xs flex items-center gap-1">
          <RefreshCw className="w-3 h-3" /> {t('chat.reconnect')}
        </button>
      </motion.div>

      <div className="flex-1 overflow-y-auto space-y-4 pb-2 pr-1">
        {msgs.length === 0 && (
          <div className="flex flex-col items-center py-10 gap-5">
            <div className="sophia-avatar w-12 h-12 text-lg animate-float">S</div>
            <p className="text-sm text-ink-muted">{t('chat.waiting')}</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {quickQ.map((q, i) => (
                <button key={i} onClick={() => send(q)}
                  className="rounded-full px-3 py-1.5 text-xs text-ink-secondary transition-all"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(139,92,246,0.4)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')}>
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
        <AnimatePresence>
          {msgs.map(m => <Bubble key={m.id} msg={m} />)}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      <div className="mt-3 rounded-xl px-4 py-3"
           style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex gap-3 items-end">
          <textarea className="flex-1 bg-transparent text-sm text-white placeholder-zinc-600 resize-none outline-none"
            placeholder={t('chat.placeholder')} rows={2} value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input) } }} />
          <button onClick={() => send(input)} disabled={!input.trim() || !online}
                  className="btn-primary w-9 h-9 p-0 rounded-lg shrink-0">
            <Send className="w-4 h-4" />
          </button>
        </div>
        <div className="flex justify-between mt-2 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          <span className="text-2xs text-ink-muted">{t('chat.enter_hint')}</span>
          <span className="text-2xs text-ink-muted">{t('chat.powered_by')}</span>
        </div>
      </div>
    </div>
  )
}
