import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Users, Wallet, DollarSign, BarChart3 } from 'lucide-react'
import { fundApi, FundStats } from '../../services/api'
import { formatUSD } from '../../services/web3'

function StatCard({
  label, value, sub, icon: Icon, positive, delay = 0
}: {
  label: string
  value: string
  sub?: string
  icon: React.ElementType
  positive?: boolean
  delay?: number
}) {
  return (
    <motion.div
      className="stat-card hover:border-bank-muted transition-colors duration-200"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="stat-label">{label}</span>
        <div className="w-8 h-8 rounded-lg bg-bank-elevated flex items-center justify-center">
          <Icon className="w-4 h-4 text-tabby-500" />
        </div>
      </div>
      <div className="stat-value">{value}</div>
      {sub && (
        <div className={`text-xs mt-1 flex items-center gap-1 ${
          positive === true  ? 'text-sophia-green' :
          positive === false ? 'text-sophia-red'   : 'text-slate-500'
        }`}>
          {positive === true  && <TrendingUp className="w-3 h-3" />}
          {positive === false && <TrendingDown className="w-3 h-3" />}
          {sub}
        </div>
      )}
    </motion.div>
  )
}

function SkeletonCard() {
  return (
    <div className="stat-card animate-pulse">
      <div className="h-3 bg-bank-elevated rounded w-24 mb-3" />
      <div className="h-7 bg-bank-elevated rounded w-32 mb-2" />
      <div className="h-3 bg-bank-elevated rounded w-20" />
    </div>
  )
}

export default function DataCards() {
  const { data: stats, isLoading } = useQuery<FundStats>({
    queryKey: ['fund-stats'],
    queryFn: fundApi.getStats,
    refetchInterval: 30_000,
  })

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    )
  }

  const pnl = stats?.total_profit_loss_usd ?? 0
  const pct = stats?.profit_loss_pct ?? 0

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      <StatCard
        label="基金总投资"
        value={`${(stats?.total_invested_bnb ?? 0).toFixed(2)} BNB`}
        icon={Wallet}
        delay={0}
      />
      <StatCard
        label="组合市值"
        value={formatUSD(stats?.total_portfolio_value_usd ?? 0)}
        icon={BarChart3}
        delay={0.05}
      />
      <StatCard
        label="盈亏 (USD)"
        value={formatUSD(Math.abs(pnl))}
        sub={`${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%`}
        positive={pnl >= 0}
        icon={pnl >= 0 ? TrendingUp : TrendingDown}
        delay={0.1}
      />
      <StatCard
        label="可用现金"
        value={`${(stats?.cash_available_bnb ?? 0).toFixed(4)} BNB`}
        icon={DollarSign}
        delay={0.15}
      />
      <StatCard
        label="投资人数"
        value={`${stats?.num_investors ?? 0}`}
        icon={Users}
        delay={0.2}
      />
      <StatCard
        label="策略人"
        value="AI Sophia"
        sub="行长实时操盘"
        icon={TrendingUp}
        delay={0.25}
      />
    </div>
  )
}
