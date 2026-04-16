import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { TrendingUp, FileText, ArrowDownLeft, ArrowUpRight, MessageCircle, ChevronRight, Sparkles } from 'lucide-react'
import DataCards from '../components/Dashboard/DataCards'
import SophiaLiveShow from '../components/LiveShow/SophiaLiveShow'

const ACTIONS = [
  {
    path: '/fund',
    icon: TrendingUp,
    label: '投资 MEME 基金',
    desc: '让 Sophia 行长为您操盘 BSC Meme 代币',
    color: 'rgba(139,92,246,0.15)',
    border: 'rgba(139,92,246,0.25)',
    iconColor: '#c084fc',
  },
  {
    path: '/research',
    icon: FileText,
    label: '投研报告',
    desc: 'Sophia 行长 AI 深度分析报告',
    color: 'rgba(99,102,241,0.15)',
    border: 'rgba(99,102,241,0.25)',
    iconColor: '#818cf8',
  },
  {
    path: '/borrow',
    icon: ArrowDownLeft,
    label: '抵押借贷',
    desc: '抵押 Meme 代币，借出 BNB',
    color: 'rgba(6,182,212,0.1)',
    border: 'rgba(6,182,212,0.2)',
    iconColor: '#22d3ee',
  },
  {
    path: '/lend',
    icon: ArrowUpRight,
    label: '放贷获益',
    desc: '选择优质订单，赚取利息',
    color: 'rgba(34,197,94,0.1)',
    border: 'rgba(34,197,94,0.2)',
    iconColor: '#4ade80',
  },
  {
    path: '/chat',
    icon: MessageCircle,
    label: '咨询 Sophia',
    desc: '与 AI 行长直接对话',
    color: 'rgba(245,158,11,0.1)',
    border: 'rgba(245,158,11,0.2)',
    iconColor: '#fbbf24',
  },
]

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="relative min-h-screen">
      {/* Background glow — bolt.new signature effect */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="absolute left-1/2 -top-40 h-[600px] w-[800px] -translate-x-1/2 rounded-full opacity-30"
          style={{ background: 'radial-gradient(ellipse, rgba(139,92,246,0.35) 0%, transparent 70%)' }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-12 space-y-14">

        {/* ── Hero ───────────────────────────────────────── */}
        <motion.section
          className="text-center space-y-5"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Live badge */}
          <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium"
               style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', color: '#4ade80' }}>
            <span className="live-dot" /> BSC 主网运行中
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            <span className="text-white">TABBY </span>
            <span className="text-gradient">MEME BANK</span>
          </h1>

          <p className="mx-auto max-w-xl text-base text-ink-secondary">
            由 AI 行长 <span className="text-gradient-gold font-semibold">Sophia</span> 管理的
            BSC 链上 Meme 代币投资与 P2P 借贷平台
          </p>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button className="btn-primary px-5 py-2.5 text-sm flex items-center gap-2"
                    onClick={() => navigate('/fund')}>
              <Sparkles className="w-4 h-4" /> 开始投资
            </button>
            <button className="btn-outline px-5 py-2.5 text-sm"
                    onClick={() => navigate('/chat')}>
              咨询 Sophia
            </button>
          </div>
        </motion.section>

        {/* ── Stats ──────────────────────────────────────── */}
        <section>
          <SectionTitle dot="purple">基金实时数据</SectionTitle>
          <DataCards />
        </section>

        {/* ── Live Show ──────────────────────────────────── */}
        <section>
          <SectionTitle dot="gold">Sophia 行长实时动态</SectionTitle>
          <SophiaLiveShow />
        </section>

        {/* ── Quick Actions ──────────────────────────────── */}
        <section>
          <SectionTitle dot="cyan">快速操作</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {ACTIONS.map(({ path, icon: Icon, label, desc, color, border, iconColor }, i) => (
              <motion.button
                key={path}
                onClick={() => navigate(path)}
                className="group text-left rounded-xl p-4 transition-all duration-200"
                style={{ background: color, border: `1px solid ${border}` }}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg"
                     style={{ background: 'rgba(0,0,0,0.3)', color: iconColor }}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="text-sm font-semibold text-white mb-1 group-hover:text-gradient transition-all">
                  {label}
                </div>
                <div className="text-xs text-ink-muted leading-relaxed mb-3">{desc}</div>
                <div className="flex items-center gap-1 text-xs" style={{ color: iconColor }}>
                  进入 <ChevronRight className="w-3 h-3" />
                </div>
              </motion.button>
            ))}
          </div>
        </section>

        {/* ── Risk Disclaimer ────────────────────────────── */}
        <div className="rounded-xl px-4 py-3 text-center text-xs text-ink-muted"
             style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)' }}>
          <span className="text-red-400 font-medium">风险提示：</span>
          Meme 代币具有极高投机风险，价格波动剧烈，投资可能损失全部本金。请理性投资，只投入您能承受损失的资金。
        </div>
      </div>
    </div>
  )
}

function SectionTitle({ children, dot }: { children: React.ReactNode; dot: 'purple' | 'gold' | 'cyan' }) {
  const colors = { purple: '#a855f7', gold: '#f59e0b', cyan: '#06b6d4' }
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="h-4 w-0.5 rounded-full" style={{ background: colors[dot] }} />
      <h2 className="text-xs font-semibold uppercase tracking-widest text-ink-secondary">{children}</h2>
    </div>
  )
}
