import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Twitter, BarChart2, Droplets, TrendingUp, TrendingDown, FileSearch, Bot, Activity } from 'lucide-react'
import { useTranslation } from 'react-i18next'
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

const NEON_MAP: Record<string, string> = {
  twitter_research:  '#00d4ff',
  market_scan:       '#9945ff',
  add_liquidity:     '#00d4ff',
  remove_liquidity:  '#ffe600',
  token_buy:         '#00ff88',
  token_sell:        '#ff2d78',
  fund_analysis:     '#9945ff',
  report_published:  '#ffe600',
  report_generating: '#9945ff',
}

const EMOJI_MAP: Record<string, string> = {
  twitter_research:  '🐦',
  market_scan:       '📊',
  add_liquidity:     '💧',
  remove_liquidity:  '🔄',
  token_buy:         '🚀',
  token_sell:        '📉',
  fund_analysis:     '🔍',
  report_published:  '📝',
  report_generating: '🤖',
}

function ActivityRow({ a, i }: { a: ActivityType; i: number }) {
  const Icon  = ICON_MAP[a.activity_type] || Activity
  const neon  = NEON_MAP[a.activity_type] || '#9945ff'
  const emoji = EMOJI_MAP[a.activity_type] || '⚡'
  const time  = new Date(a.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  return (
    <motion.div className="flex items-start gap-3 py-2.5"
      style={{ borderBottom: '1px solid rgba(153,69,255,0.08)' }}
      initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
    >
      <div className="mt-0.5 shrink-0 text-sm w-5 text-center">{emoji}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-body leading-snug" style={{ color: '#c8c8e8' }}>{a.description}</p>
        {a.token_symbol && (
          <span className="badge-purple mt-1 inline-block" style={{ fontSize: '0.65rem' }}>${a.token_symbol}</span>
        )}
      </div>
      <span className="shrink-0 font-mono text-xs" style={{ color: '#6666aa' }}>{time}</span>
    </motion.div>
  )
}

export default function SophiaLiveShow() {
  const { t } = useTranslation()
  const { data: activities = [], isLoading } = useQuery<ActivityType[]>({
    queryKey: ['sophia-activities'], queryFn: () => sophiaApi.getActivities(8), refetchInterval: 15_000,
  })

  return (
    <div className="rounded-2xl p-5"
         style={{ background: '#12122a', border: '2px solid rgba(153,69,255,0.25)', boxShadow: '0 0 30px rgba(153,69,255,0.1)' }}>

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="sophia-avatar w-10 h-10 text-xl shrink-0 animate-float">🐱</div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-meme text-lg text-white tracking-wide">{t('live.president')}</span>
              <span className="flex items-center gap-1 text-xs font-body font-semibold text-neon-green">
                <span className="live-dot" /> LIVE
              </span>
            </div>
            <p className="text-xs font-body" style={{ color: '#6666aa' }}>{t('live.subtitle')}</p>
          </div>
        </div>
        <div className="badge-cyan font-body text-xs">⛓️ {t('live.bsc_mainnet')}</div>
      </div>

      {/* Activity feed */}
      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-3 items-center">
              <div className="w-5 h-5 rounded" style={{ background: '#1e1e40' }} />
              <div className="h-3 flex-1 rounded" style={{ background: '#1e1e40' }} />
            </div>
          ))}
        </div>
      ) : activities.length === 0 ? (
        <p className="py-8 text-center text-sm font-body" style={{ color: '#6666aa' }}>
          🤔 {t('live.thinking')}
        </p>
      ) : (
        <AnimatePresence>
          {activities.map((a, i) => <ActivityRow key={a.id} a={a} i={i} />)}
        </AnimatePresence>
      )}

      {/* Footer */}
      <div className="mt-3 flex justify-between items-center pt-3"
           style={{ borderTop: '1px solid rgba(153,69,255,0.1)' }}>
        <span className="text-xs font-body" style={{ color: '#6666aa' }}>🔄 {t('live.auto_update')}</span>
        <span className="text-xs font-body font-semibold" style={{ color: '#9945ff' }}>🛡️ {t('live.guardian')}</span>
      </div>
    </div>
  )
}
