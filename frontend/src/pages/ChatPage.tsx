import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, Send, RefreshCw, Bot } from 'lucide-react'
import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'

interface ChatMsg {
  id: string
  role: 'user' | 'sophia'
  content: string
  streaming?: boolean
}

const QUICK_QUESTIONS = [
  '目前 TABBY MEME 基金的表现如何？',
  'BSC 链上现在有哪些值得关注的 Meme 代币？',
  '如何抵押 Meme 代币借贷？',
  'Sophia 行长的投资策略是什么？',
  'PEPE 代币现在值得投资吗？',
]

function MsgBubble({ msg }: { msg: ChatMsg }) {
  const isUser = msg.role === 'user'
  return (
    <motion.div
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Avatar */}
      {!isUser && (
        <div className="sophia-avatar text-sm shrink-0 glow-gold animate-float">S</div>
      )}
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-tabby-500/20 border border-tabby-500/30 flex items-center justify-center shrink-0">
          <Bot className="w-4 h-4 text-tabby-400" />
        </div>
      )}

      <div className={`max-w-[80%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        {!isUser && (
          <span className="text-xs text-sophia-gold font-semibold">Sophia 行长</span>
        )}
        <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? 'bg-tabby-500 text-white rounded-tr-sm'
            : 'bg-bank-elevated border border-bank-border text-slate-200 rounded-tl-sm'
        }`}>
          {msg.content}
          {msg.streaming && (
            <span className="inline-block w-1.5 h-4 bg-sophia-gold ml-1 animate-pulse rounded-sm" />
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default function ChatPage() {
  const { address, isConnected } = useAccount()
  const [messages, setMessages] = useState<ChatMsg[]>([])
  const [input, setInput] = useState('')
  const [connected, setConnected] = useState(false)
  const [sessionId] = useState(() => `session-${Date.now()}-${Math.random().toString(36).slice(2)}`)
  const wsRef = useRef<WebSocket | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => { scrollToBottom() }, [messages, scrollToBottom])

  const connectWs = useCallback(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const host = window.location.hostname
    const port = import.meta.env.DEV ? '8000' : window.location.port

    const ws = new WebSocket(`${protocol}//${host}:${port}/api/sophia/chat/${sessionId}`)
    wsRef.current = ws

    ws.onopen = () => setConnected(true)
    ws.onclose = () => setConnected(false)

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data)

      if (data.type === 'message' && data.role === 'sophia') {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'sophia',
          content: data.content,
        }])
      } else if (data.type === 'start') {
        setMessages(prev => [...prev, {
          id: `streaming-${Date.now()}`,
          role: 'sophia',
          content: '',
          streaming: true,
        }])
      } else if (data.type === 'chunk') {
        setMessages(prev => {
          const last = prev[prev.length - 1]
          if (last?.streaming) {
            return [...prev.slice(0, -1), { ...last, content: last.content + data.content }]
          }
          return prev
        })
      } else if (data.type === 'end') {
        setMessages(prev => {
          const last = prev[prev.length - 1]
          if (last?.streaming) {
            return [...prev.slice(0, -1), { ...last, streaming: false }]
          }
          return prev
        })
      }
    }
  }, [sessionId])

  useEffect(() => {
    connectWs()
    return () => wsRef.current?.close()
  }, [connectWs])

  const sendMessage = (text: string) => {
    if (!text.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return

    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'user',
      content: text,
    }])

    wsRef.current.send(JSON.stringify({
      content: text,
      wallet_address: address || null,
    }))

    setInput('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  if (!isConnected) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="sophia-avatar text-3xl mx-auto mb-4 glow-gold w-16 h-16">S</div>
        <h2 className="font-display font-bold text-white text-xl mb-2">咨询 Sophia 行长</h2>
        <p className="text-slate-500 text-sm mb-6">
          请连接钱包以识别您的身份，获得个性化的投资建议
        </p>
        <ConnectButton />
        <p className="text-xs text-slate-600 mt-4">（也可以不连接钱包直接开始对话）</p>
        <button
          className="btn-ghost mt-2 text-sm"
          onClick={connectWs}
        >
          直接开始对话
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 h-[calc(100vh-72px)] flex flex-col">
      {/* Chat Header */}
      <motion.div
        className="flex items-center gap-3 mb-4 p-4 card border-sophia-gold/20"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="sophia-avatar text-lg glow-gold animate-float">S</div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-white text-sm">Sophia 行长</span>
            {connected ? (
              <div className="live-indicator"><span className="live-dot" />在线</div>
            ) : (
              <span className="text-xs text-slate-600">连接中...</span>
            )}
          </div>
          <p className="text-xs text-slate-500">TABBY MEME BANK · AI 行长 · 专业 BSC Meme 投资顾问</p>
        </div>
        <button
          onClick={() => { wsRef.current?.close(); setTimeout(connectWs, 500) }}
          className="btn-ghost text-xs flex items-center gap-1"
        >
          <RefreshCw className="w-3.5 h-3.5" /> 重连
        </button>
      </motion.div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <div className="sophia-avatar text-2xl mx-auto mb-3 glow-gold w-14 h-14">S</div>
            <p className="text-slate-400 text-sm mb-6">Sophia 行长正在等待您的问题...</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {QUICK_QUESTIONS.map(q => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="text-xs border border-bank-border bg-bank-surface hover:border-tabby-500/50
                             hover:text-tabby-400 text-slate-400 px-3 py-2 rounded-xl transition-all"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        <AnimatePresence>
          {messages.map(msg => <MsgBubble key={msg.id} msg={msg} />)}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="card border-bank-muted">
        <div className="flex gap-3 items-end">
          <textarea
            className="flex-1 bg-transparent text-sm text-white placeholder-slate-600 resize-none outline-none"
            placeholder="输入您的问题，按 Enter 发送..."
            rows={2}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || !connected}
            className="btn-primary px-4 py-2 shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <div className="flex justify-between mt-2 pt-2 border-t border-bank-border/50">
          <p className="text-xs text-slate-600">Enter 发送 · Shift+Enter 换行</p>
          <p className="text-xs text-slate-600">由 Claude AI 驱动</p>
        </div>
      </div>
    </div>
  )
}
