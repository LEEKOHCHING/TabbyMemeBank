import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, RefreshCw } from 'lucide-react'
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
        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-meme text-base"
             style={{ background: 'linear-gradient(135deg,#ff2d78,#ff6b00)', boxShadow: '0 0 12px rgba(255,45,120,0.4)' }}>
          👤
        </div>
      ) : (
        <div className="sophia-avatar w-8 h-8 text-base shrink-0">🐱</div>
      )}

      <div className={`max-w-[78%] flex flex-col gap-1 ${isUser ? 'items-end' : ''}`}>
        <span className="text-xs font-body font-semibold" style={{ color: '#6666aa' }}>
          {isUser ? t('chat.you') : 'Sophia 🐱'}
        </span>
        <div className="rounded-2xl px-4 py-3 text-sm font-body leading-relaxed"
          style={isUser ? {
            background: 'linear-gradient(135deg, #ff2d78, #ff6b00)',
            color: '#fff',
            borderRadius: '16px 4px 16px 16px',
            boxShadow: '0 0 16px rgba(255,45,120,0.3)',
          } : {
            background: '#1a1a35',
            border: '1px solid rgba(153,69,255,0.25)',
            color: '#c8c8e8',
            borderRadius: '4px 16px 16px 16px',
            boxShadow: '0 0 12px rgba(153,69,255,0.1)',
          }}>
          {msg.content}
          {msg.streaming && (
            <span className="inline-block w-1.5 h-4 ml-1 rounded-sm animate-pulse"
                  style={{ background: '#9945ff', verticalAlign: 'middle' }} />
          )}
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
      <div className="sophia-avatar w-20 h-20 text-4xl mx-auto mb-5 animate-float">🐱</div>
      <h2 className="font-meme text-3xl text-white mb-2 tracking-wide">{t('chat.connect_title')}</h2>
      <p className="text-sm font-body mb-6" style={{ color: '#6666aa' }}>{t('chat.connect_desc')}</p>
      <ConnectButton />
      <button onClick={connect} className="btn-ghost mt-3 text-xs font-body w-full">{t('chat.skip_connect')}</button>
    </div>
  )

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 flex flex-col" style={{ height: 'calc(100vh - 56px)' }}>

      {/* Chat header */}
      <motion.div className="flex items-center gap-3 mb-4 rounded-2xl px-4 py-3"
        style={{ background: '#12122a', border: '2px solid rgba(153,69,255,0.3)', boxShadow: '0 0 20px rgba(153,69,255,0.1)' }}
        initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="sophia-avatar w-10 h-10 text-xl animate-float shrink-0">🐱</div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-meme text-xl text-white tracking-wide">{t('live.president')}</span>
            <span className={`flex items-center gap-1 text-xs font-body font-semibold ${online ? 'text-neon-green' : ''}`}
                  style={!online ? { color: '#6666aa' } : {}}>
              {online ? <><span className="live-dot" />{t('chat.online')}</> : `⏳ ${t('chat.connecting')}`}
            </span>
          </div>
          <p className="text-xs font-body" style={{ color: '#6666aa' }}>{t('chat.subtitle')}</p>
        </div>
        <button onClick={() => { wsRef.current?.close(); setTimeout(connect, 500) }}
                className="btn-ghost text-xs font-body flex items-center gap-1">
          <RefreshCw className="w-3 h-3" /> {t('chat.reconnect')}
        </button>
      </motion.div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-2 pr-1">
        {msgs.length === 0 && (
          <div className="flex flex-col items-center py-10 gap-5">
            <div className="sophia-avatar w-16 h-16 text-3xl animate-float">🐱</div>
            <p className="font-meme text-xl text-white tracking-wide">MEOW! ASK ME ANYTHING 🚀</p>
            <p className="text-sm font-body" style={{ color: '#6666aa' }}>{t('chat.waiting')}</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {quickQ.map((q, i) => (
                <motion.button key={i} onClick={() => send(q)}
                  className="rounded-full px-4 py-2 text-xs font-body font-semibold transition-all"
                  style={{ background: 'rgba(153,69,255,0.1)', border: '1px solid rgba(153,69,255,0.3)', color: '#bb77ff' }}
                  whileHover={{ scale: 1.05, boxShadow: '0 0 12px rgba(153,69,255,0.3)' }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = '#9945ff')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(153,69,255,0.3)')}>
                  {q}
                </motion.button>
              ))}
            </div>
          </div>
        )}
        <AnimatePresence>
          {msgs.map(m => <Bubble key={m.id} msg={m} />)}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="mt-3 rounded-2xl px-4 py-3"
           style={{ background: '#12122a', border: '2px solid rgba(153,69,255,0.25)', boxShadow: '0 0 16px rgba(153,69,255,0.08)' }}>
        <div className="flex gap-3 items-end">
          <textarea
            className="flex-1 bg-transparent text-sm font-body text-white resize-none outline-none"
            style={{ caretColor: '#9945ff' }}
            placeholder={t('chat.placeholder')}
            rows={2}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input) } }}
          />
          <motion.button
            onClick={() => send(input)}
            disabled={!input.trim() || !online}
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg,#9945ff,#00ff88)', boxShadow: '0 0 16px rgba(153,69,255,0.4)' }}
            whileHover={{ scale: 1.08, boxShadow: '0 0 24px rgba(0,255,136,0.4)' }}
            whileTap={{ scale: 0.95 }}
          >
            <Send className="w-4 h-4 text-black" />
          </motion.button>
        </div>
        <div className="flex justify-between mt-2 pt-2" style={{ borderTop: '1px solid rgba(153,69,255,0.1)' }}>
          <span className="text-xs font-body" style={{ color: '#4a4a6a' }}>{t('chat.enter_hint')}</span>
          <span className="text-xs font-body" style={{ color: '#4a4a6a' }}>🤖 {t('chat.powered_by')}</span>
        </div>
      </div>
    </div>
  )
}
