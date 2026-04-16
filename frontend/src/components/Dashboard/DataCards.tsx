import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Users, Wallet, DollarSign, BarChart3 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { fundApi, FundStats } from '../../services/api'
import { formatUSD } from '../../services/web3'

function StatCard({ labelKey, value, subKey, icon: Icon, trend, delay = 0 }: {
  labelKey: string; value: string; subKey?: string
  icon: React.ElementType; trend?: 'up' | 'down' | 'neutral'; delay?: number
}) {
  const { t } = useTranslation()
  return (
    <motion.div className="stat-card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.35 }}>
      <div className="flex items-center justify-between mb-2">
        <span className="stat-label">{t(labelKey)}</span>
        <div className="flex h-7 w-7 items-center justify-center rounded-lg"
             style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.2)' }}>
          <Icon className="w-3.5 h-3.5 text-primary-400" />
        </div>
      </div>
      <div className="stat-value">{value}</div>
      {subKey && (
        <div className={`mt-1 flex items-center gap-1 text-xs ${
          trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-red-400' : 'text-ink-muted'
        }`}>
          {trend === 'up'   && <TrendingUp  className="w-3 h-3" />}
          {trend === 'down' && <TrendingDown className="w-3 h-3" />}
          {t(subKey)}
        </div>
      )}
    </motion.div>
  )
}

function SkeletonCard() {
  return (
    <div className="stat-card animate-pulse">
      <div className="mb-3 h-2.5 w-20 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }} />
      <div className="h-6 w-28 rounded-lg"           style={{ background: 'rgba(255,255,255,0.06)' }} />
    </div>
  )
}

export default function DataCards() {
  const { data: stats, isLoading } = useQuery<FundStats>({
    queryKey: ['fund-stats'], queryFn: fundApi.getStats, refetchInterval: 30_000,
  })

  if (isLoading) return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
    </div>
  )

  const pnl = stats?.total_profit_loss_usd ?? 0
  const pct = stats?.profit_loss_pct ?? 0

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      <StatCard labelKey="stats.total_invested"   value={`${(stats?.total_invested_bnb ?? 0).toFixed(2)} BNB`} icon={Wallet}     delay={0}    />
      <StatCard labelKey="stats.portfolio_value"  value={formatUSD(stats?.total_portfolio_value_usd ?? 0)}     icon={BarChart3}  delay={0.05} />
      <StatCard labelKey="stats.profit_loss"      value={formatUSD(Math.abs(pnl))}
                subKey={undefined} trend={pnl >= 0 ? 'up' : 'down'}
                icon={pnl >= 0 ? TrendingUp : TrendingDown}                                                                      delay={0.1}  />
      <StatCard labelKey="stats.cash_available"   value={`${(stats?.cash_available_bnb ?? 0).toFixed(4)} BNB`} icon={DollarSign} delay={0.15} />
      <StatCard labelKey="stats.investors"        value={`${stats?.num_investors ?? 0}`}                        icon={Users}      delay={0.2}  />
      <StatCard labelKey="stats.strategy_manager" value="AI Sophia" subKey="stats.live_trading" trend="neutral" icon={TrendingUp} delay={0.25} />
    </div>
  )
}
