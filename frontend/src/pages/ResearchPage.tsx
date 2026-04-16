import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react'
import { sophiaApi, Report, ReportDetail } from '../services/api'

const REC: Record<string, { badge: string; neon: string; icon: React.ElementType; label: string; emoji: string }> = {
  BUY:   { badge: 'badge-green',  neon: '#00ff88', icon: TrendingUp,   label: 'BUY 🚀',  emoji: '🟢' },
  SELL:  { badge: 'badge-pink',   neon: '#ff2d78', icon: TrendingDown,  label: 'SELL 📉', emoji: '🔴' },
  HOLD:  { badge: 'badge-yellow', neon: '#ffe600', icon: Minus,         label: 'HOLD 💎', emoji: '🟡' },
  WATCH: { badge: 'badge-purple', neon: '#9945ff', icon: AlertTriangle, label: 'WATCH 👀', emoji: '🟣' },
}
const RISK: Record<string, string> = { LOW: 'badge-green', MEDIUM: 'badge-yellow', HIGH: 'badge-pink' }

function ReportCard({ report, i }: { report: Report; i: number }) {
  const [open, setOpen]       = useState(false)
  const [detail, setDetail]   = useState<ReportDetail | null>(null)
  const rec = REC[report.recommendation ?? 'WATCH'] ?? REC.WATCH
  const RecIcon = rec.icon

  const toggle = async () => {
    if (!open && !detail) setDetail(await sophiaApi.getReportDetail(report.id))
    setOpen(v => !v)
  }

  return (
    <motion.div
      className="rounded-2xl p-5"
      style={{ background: '#12122a', border: `2px solid ${rec.neon}25`, boxShadow: `0 0 16px ${rec.neon}10` }}
      layout
      initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
      whileHover={{ scale: 1.01, boxShadow: `0 0 24px ${rec.neon}25` }}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1">
          <div className="flex flex-wrap gap-1.5 mb-2">
            {report.token_symbol && (
              <span className="badge-purple font-body font-bold">${report.token_symbol}</span>
            )}
            <span className={`badge ${rec.badge} font-body`}>
              <RecIcon className="w-3 h-3" /> {rec.label}
            </span>
            {report.risk_level && (
              <span className={`badge ${RISK[report.risk_level]} font-body`}>
                ⚠️ {report.risk_level}
              </span>
            )}
            {report.confidence_score != null && (
              <span className="badge badge-cyan font-body">🎯 {report.confidence_score}%</span>
            )}
          </div>
          <h3 className="font-meme text-lg text-white tracking-wide">{report.title}</h3>
        </div>
        <span className="text-xs font-body shrink-0" style={{ color: '#6666aa' }}>
          {new Date(report.published_at).toLocaleDateString()}
        </span>
      </div>

      <p className="text-sm font-body leading-relaxed mb-4" style={{ color: '#8888aa' }}>{report.summary}</p>

      <button onClick={toggle}
        className="flex items-center gap-1.5 text-xs font-body font-semibold transition-colors"
        style={{ color: rec.neon }}
        onMouseEnter={e => (e.currentTarget.style.opacity = '0.75')}
        onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
        {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        {open ? '▲ Collapse Report' : '▼ Read Full Report'}
      </button>

      <AnimatePresence>
        {open && detail && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }} className="overflow-hidden"
          >
            <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${rec.neon}20` }}>
              <pre className="whitespace-pre-wrap text-xs font-body leading-relaxed rounded-xl p-4"
                   style={{ background: 'rgba(0,0,0,0.4)', color: '#c8c8e8', border: '1px solid #1e1e40' }}>
                {detail.full_report}
              </pre>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function ResearchPage() {
  const { data: reports = [], isLoading } = useQuery<Report[]>({
    queryKey: ['sophia-reports'],
    queryFn: () => sophiaApi.getReports(20),
    refetchInterval: 60_000,
  })

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">

      {/* Header */}
      <motion.div className="flex items-center gap-4 mb-8" initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="sophia-avatar w-12 h-12 text-2xl animate-float">📊</div>
        <div>
          <h1 className="font-meme text-4xl text-white tracking-wide" style={{ letterSpacing: '0.05em' }}>
            RESEARCH <span className="text-neon-cyan">REPORTS</span>
          </h1>
          <p className="text-sm font-body mt-1" style={{ color: '#6666aa' }}>
            🤖 AI Sophia's deep-dive Meme token analysis
          </p>
        </div>
      </motion.div>

      {isLoading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => (
            <div key={i} className="rounded-2xl p-5 animate-pulse" style={{ background: '#12122a', border: '2px solid #1e1e40', height: '7rem' }} />
          ))}
        </div>
      ) : reports.length === 0 ? (
        <div className="rounded-2xl p-16 flex flex-col items-center gap-4"
             style={{ background: '#12122a', border: '2px solid rgba(153,69,255,0.2)' }}>
          <span className="text-5xl">📝</span>
          <p className="font-meme text-xl text-white">SOPHIA IS WRITING...</p>
          <p className="text-sm font-body" style={{ color: '#6666aa' }}>First research report coming soon 🐱</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((r, i) => <ReportCard key={r.id} report={r} i={i} />)}
        </div>
      )}
    </div>
  )
}
