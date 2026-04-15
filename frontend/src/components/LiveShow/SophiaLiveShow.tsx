import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Activity, Twitter, BarChart2, Droplets, TrendingUp, TrendingDown, FileSearch, Bot } from 'lucide-react'
import { sophiaApi, Activity as ActivityType } from '../../services/api'

const ACTIVITY_ICONS: Record<string, React.ElementType> = {
  twitter_research:   Twitter,
  market_scan:        BarChart2,
  add_liquidity:      Droplets,
  remove_liquidity:   Droplets,
  token_buy:          TrendingUp,
  token_sell:         TrendingDown,
  fund_analysis:      FileSearch,
  report_published:   FileSearch,
  report_generating:  Bot,
  default:            Activity,
}

const ACTIVITY_COLORS: Record<string, string> = {
  twitter_research:  'text-sky-400',
  market_scan:       'text-violet-400',
  add_liquidity:     'text-sophia-cyan',
  remove_liquidity:  'text-sophia-gold',
  token_buy:         'text-sophia-green',
  token_sell:        'text-sophia-red',
  fund_analysis:     'text-tabby-400',
  report_published:  'text-sophia-gold',
  report_generating: 'text-sophia-purple',
  default:           'text-slate-400',
}

function ActivityItem({ activity, index }: { activity: ActivityType; index: number }) {
  const Icon = ACTIVITY_ICONS[activity.activity_type] || ACTIVITY_ICONS.default
  const color = ACTIVITY_COLORS[activity.activity_type] || ACTIVITY_COLORS.default
  const time = new Date(activity.created_at).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex items-start gap-3 py-2.5 border-b border-bank-border/50 last:border-0"
    >
      <div className={`mt-0.5 shrink-0 ${color}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white leading-snug">{activity.description}</p>
        {activity.token_symbol && (
          <span className="badge badge-purple mt-1">
            ${activity.token_symbol}
          </span>
        )}
      </div>
      <span className="text-xs text-slate-600 shrink-0 font-mono">{time}</span>
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
    <div className="card-elevated border border-tabby-500/20 glow-orange">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Sophia Avatar */}
          <div className="sophia-avatar text-lg animate-float glow-gold">S</div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-white text-sm">SOPHIA 行长</span>
              <div className="live-indicator">
                <span className="live-dot" />
                LIVE
              </div>
            </div>
            <p className="text-xs text-slate-500">AI 行长实时操盘动态</p>
          </div>
        </div>
        <div className="badge badge-cyan">BSC 主网</div>
      </div>

      {/* Live activities */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="w-4 h-4 bg-bank-surface rounded mt-0.5" />
              <div className="flex-1 h-4 bg-bank-surface rounded" />
            </div>
          ))}
        </div>
      ) : (
        <AnimatePresence>
          <div>
            {activities.length === 0 ? (
              <div className="text-center text-slate-500 text-sm py-6">
                Sophia 行长正在思考中...
              </div>
            ) : (
              activities.map((a, i) => (
                <ActivityItem key={a.id} activity={a} index={i} />
              ))
            )}
          </div>
        </AnimatePresence>
      )}

      <div className="mt-3 pt-3 border-t border-bank-border/50 flex items-center justify-between">
        <span className="text-xs text-slate-600">每 15 秒自动更新</span>
        <span className="text-xs text-tabby-500">Sophia 正在为您守护资金安全</span>
      </div>
    </div>
  )
}
