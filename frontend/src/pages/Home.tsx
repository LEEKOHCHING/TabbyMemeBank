import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { TrendingUp, FileText, ArrowDownLeft, ArrowUpRight, MessageCircle, ChevronRight } from 'lucide-react'
import DataCards from '../components/Dashboard/DataCards'
import SophiaLiveShow from '../components/LiveShow/SophiaLiveShow'

const QUICK_ACTIONS = [
  {
    path: '/fund',
    icon: TrendingUp,
    label: '投资 MEME 基金',
    desc: '让 Sophia 行长为您操盘 BSC 链上的 Meme 代币',
    color: 'from-tabby-500 to-tabby-600',
    glow: 'hover:shadow-tabby-500/20',
  },
  {
    path: '/research',
    icon: FileText,
    label: '查看投研报告',
    desc: 'Sophia 行长最新的 Meme 代币深度分析',
    color: 'from-sophia-purple to-violet-700',
    glow: 'hover:shadow-violet-500/20',
  },
  {
    path: '/borrow',
    icon: ArrowDownLeft,
    label: '抵押借贷',
    desc: '抵押 Meme 代币，借出 BNB 周转',
    color: 'from-sophia-cyan to-blue-600',
    glow: 'hover:shadow-cyan-500/20',
  },
  {
    path: '/lend',
    icon: ArrowUpRight,
    label: '放贷获益',
    desc: '选择优质抵押订单，赚取利息收益',
    color: 'from-sophia-green to-emerald-700',
    glow: 'hover:shadow-green-500/20',
  },
  {
    path: '/chat',
    icon: MessageCircle,
    label: '咨询 Sophia',
    desc: '直接与 AI 行长对话，获取专业投资建议',
    color: 'from-sophia-gold to-yellow-600',
    glow: 'hover:shadow-yellow-500/20',
  },
]

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-10">

      {/* Hero */}
      <motion.div
        className="text-center space-y-4 py-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="inline-flex items-center gap-2 badge badge-cyan mb-2">
          <span className="live-dot" />
          BSC 主网运行中
        </div>
        <h1 className="font-display font-black text-4xl md:text-6xl">
          <span className="text-white">TABBY </span>
          <span className="text-gradient">MEME BANK</span>
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          由 AI 行长 <span className="text-sophia-gold font-semibold">Sophia</span> 管理的
          BSC 链上 Meme 代币投资与 P2P 借贷平台
        </p>
      </motion.div>

      {/* Data Dashboard */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-5 bg-tabby-500 rounded-full" />
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">基金实时数据</h2>
        </div>
        <DataCards />
      </section>

      {/* Sophia Live Show */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-5 bg-sophia-gold rounded-full" />
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Sophia 行长实时动态</h2>
        </div>
        <SophiaLiveShow />
      </section>

      {/* Quick Actions */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-5 bg-sophia-purple rounded-full" />
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">快速操作</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          {QUICK_ACTIONS.map(({ path, icon: Icon, label, desc, color, glow }, i) => (
            <motion.button
              key={path}
              onClick={() => navigate(path)}
              className={`card text-left hover:border-bank-muted transition-all duration-300
                         hover:shadow-lg ${glow} group`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color}
                              flex items-center justify-center mb-3 glow-orange`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div className="font-semibold text-white text-sm mb-1 group-hover:text-tabby-400 transition-colors">
                {label}
              </div>
              <div className="text-xs text-slate-500 leading-relaxed mb-3">{desc}</div>
              <div className="flex items-center gap-1 text-xs text-tabby-500 font-medium">
                进入 <ChevronRight className="w-3 h-3" />
              </div>
            </motion.button>
          ))}
        </div>
      </section>

      {/* Disclaimer */}
      <div className="card border-sophia-red/20 bg-sophia-red/5 text-center">
        <p className="text-xs text-slate-500">
          <span className="text-sophia-red font-semibold">风险提示：</span>
          Meme 代币具有极高投机风险，价格波动剧烈。本平台所有功能仅供参考，
          不构成投资建议。投资前请充分了解风险，只投入您能够承受损失的资金。
        </p>
      </div>
    </div>
  )
}
