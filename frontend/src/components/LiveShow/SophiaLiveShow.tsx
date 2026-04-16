import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Twitter, BarChart2, Droplets, TrendingUp, TrendingDown, FileSearch, Bot, Activity } from 'lucide-react'
import { sophiaApi, Activity as ActivityType } from '../../services/api'

const ICON_MAP: Record<string, React.ElementType> = {
  twitter_research:  Twitter,
  market_scan:       BarChart2,
  add_liquidity:     Droplets,
  remove_liquidity:  Droplets,
  token_buy:         TrendingUp,
  token_sell:        TrendingDown,
  fund_analysis:     FileSearch,
  report_published:  FileSearch,
  report_generating: Bot,
}

const COLOR_MAP: Record<string, string> = {
  twitter_research:  'text-sky-400',
  market_scan:       'text-primary-400',
  add_liquidity:     'text-cyan-400',
  remove_liquidity:  'text-amber-400',
  token_buy:         'text-green-400',
  token_sell:        'text-red-400',
  fund_analysis:     'text-primary-300',
  report_published:  'text-amber-300',
  report_generating: 'text-primary-400',
}

function ActivityRow({ a, i }: { a: ActivityType; i: number }) {
  const Icon  = ICON_MAP[a.activity_type]  || Activity
  const color = COLOR_MAP[a.activity_type] || 'text-ink-muted'
  const time  = new Date(a.created_at).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })

  return (
    <motion.div
      className="flex items-start gap-3 py-2.5"
      style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: i * 0.04 }}
    >
      <div className={`mt-0.5 shrink-0 ${color}`}>
        <Icon className="w-3.5 h-3.5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-ink-secondary leading-snug">{a.description}</p>
        {a.token_symbol && (
          <span className="badge-purple mt-1 text-2xs">${a.token_symbol}</span>
        )}
      </div>
      <span className="shrink-0 font-mono text-2xs text-ink-muted">{time}</span>
    </motion.div>
  )
}

export default function SophiaLiveShow() {
  const { data: activities = [], isLoading } = useQuery<ActivityType[]>({
    queryKey: ['sophia-activities'],
    queryFn: () => sophiaApi.getActivities(8),
    refetchInterval: 15_000,
  })

  return (
    <div
      className="rounded-xl p-5"
      style={{
        background: 'rgba(139,92,246,0.04)',
        border: '1px solid rgba(139,92,246,0.2)',
        boxShadow: '0 0 40px rgba(139,92,246,0.06)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="sophia-avatar w-9 h-9 text-sm shrink-0 animate-float">S</div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-white">Sophia 行长</span>
              <span className="flex items-center gap-1 text-2xs text-green-400 font-medium">
                <span className="live-dot" /> LIVE
              </span>
            </div>
            <p className="text-2xs text-ink-muted">AI 行长实时操盘动态</p>
          </div>
        </div>
        <span className="badge-cyan text-2xs">BSC 主网</span>
      </div>

      {/* Feed */}
      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-3 items-center">
              <div className="w-3.5 h-3.5 rounded" style={{ background: 'rgba(255,255,255,0.06)' }} />
              <div className="h-3 flex-1 rounded" style={{ background: 'rgba(255,255,255,0.06)' }} />
            </div>
          ))}
        </div>
      ) : activities.length === 0 ? (
        <p className="py-6 text-center text-sm text-ink-muted">Sophia 行长正在思考中…</p>
      ) : (
        <AnimatePresence>
          {activities.map((a, i) => <ActivityRow key={a.id} a={a} i={i} />)}
        </AnimatePresence>
      )}

      <div className="mt-3 flex justify-between items-center pt-3"
           style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <span className="text-2xs text-ink-muted">每 15 秒自动更新</span>
        <span className="text-2xs text-primary-400">守护您的每一笔资金</span>
      </div>
    </div>
  )
}
