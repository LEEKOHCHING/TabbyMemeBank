import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Users, Wallet, DollarSign, BarChart3 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { fundApi, FundStats } from '../../services/api'
import { formatUSD } from '../../services/web3'

const CARD_STYLES = [
  { emoji: '💸', neon: '#9945ff', glow: 'rgba(153,69,255,0.2)' },
  { emoji: '📊', neon: '#00d4ff', glow: 'rgba(0,212,255,0.2)'  },
  { emoji: '📈', neon: '#00ff88', glow: 'rgba(0,255,136,0.2)'  },
  { emoji: '🏦', neon: '#ffe600', glow: 'rgba(255,230,0,0.2)'  },
  { emoji: '👥', neon: '#ff2d78', glow: 'rgba(255,45,120,0.2)' },
  { emoji: '🤖', neon: '#ff6b00', glow: 'rgba(255,107,0,0.2)'  },
]

function StatCard({ labelKey, value, sub, trend, style: s, delay = 0 }: {
  labelKey: string; value: string; sub?: string
  trend?: 'up' | 'down' | 'neutral'; style: typeof CARD_STYLES[0]; delay?: number
}) {
  const { t } = useTranslation()
  return (
    <motion.div
      className="rounded-2xl p-4 flex flex-col gap-1"
      style={{ background: '#12122a', border: `2px solid ${s.neon}30`, boxShadow: `0 0 16px ${s.glow}` }}
      initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
      whileHover={{ scale: 1.03, boxShadow: `0 0 28px ${s.glow}` }}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-body font-semibold uppercase tracking-widest" style={{ color: '#6666aa' }}>
          {t(labelKey)}
        </span>
        <span className="text-lg">{s.emoji}</span>
      </div>
      <div className="font-meme text-2xl text-white" style={{ letterSpacing: '0.03em' }}>{value}</div>
      {sub && (
        <div className={`text-xs font-body font-semibold flex items-center gap-1 ${
          trend === 'up' ? 'text-neon-green' : trend === 'down' ? 'text-neon-pink' : ''
        }`} style={ trend === 'neutral' ? { color: s.neon } : {} }>
          {trend === 'up'   && <TrendingUp  className="w-3 h-3" />}
          {trend === 'down' && <TrendingDown className="w-3 h-3" />}
          {sub}
        </div>
      )}
    </motion.div>
  )
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl p-4 animate-pulse" style={{ background: '#12122a', border: '2px solid #1e1e40' }}>
      <div className="h-3 w-20 rounded mb-3" style={{ background: '#1e1e40' }} />
      <div className="h-7 w-28 rounded"      style={{ background: '#1e1e40' }} />
    </div>
  )
}

export default function DataCards() {
  const { data: stats, isLoading } = useQuery<FundStats>({
    queryKey: ['fund-stats'], queryFn: fundApi.getStats, refetchInterval: 30_000,
  })
  const { t } = useTranslation()

  if (isLoading) return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
    </div>
  )

  const pnl = stats?.total_profit_loss_usd ?? 0
  const pct = stats?.profit_loss_pct ?? 0

  const cards = [
    { labelKey: 'stats.total_invested',   value: `${(stats?.total_invested_bnb ?? 0).toFixed(2)} BNB` },
    { labelKey: 'stats.portfolio_value',  value: formatUSD(stats?.total_portfolio_value_usd ?? 0) },
    { labelKey: 'stats.profit_loss',      value: formatUSD(Math.abs(pnl)),   sub: `${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%`, trend: (pnl >= 0 ? 'up' : 'down') as 'up' | 'down' },
    { labelKey: 'stats.cash_available',   value: `${(stats?.cash_available_bnb ?? 0).toFixed(4)} BNB` },
    { labelKey: 'stats.investors',        value: `${stats?.num_investors ?? 0} 🧑‍🚀` },
    { labelKey: 'stats.strategy_manager', value: 'AI Sophia 🐱', sub: t('stats.live_trading'), trend: 'neutral' as 'neutral' },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {cards.map((c, i) => (
        <StatCard key={i} {...c} style={CARD_STYLES[i]} delay={i * 0.05} />
      ))}
    </div>
  )
}
