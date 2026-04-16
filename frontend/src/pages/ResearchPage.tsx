import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, TrendingUp, TrendingDown, Minus, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react'
import { sophiaApi, Report, ReportDetail } from '../services/api'

const REC: Record<string, { badge: string; color: string; icon: React.ElementType; label: string }> = {
  BUY:   { badge: 'badge-green',  color: '#4ade80', icon: TrendingUp,   label: '建议买入' },
  SELL:  { badge: 'badge-red',    color: '#f87171', icon: TrendingDown,  label: '建议卖出' },
  HOLD:  { badge: 'badge-amber',  color: '#fbbf24', icon: Minus,         label: '建议持有' },
  WATCH: { badge: 'badge-purple', color: '#c084fc', icon: AlertTriangle, label: '观望'     },
}
const RISK: Record<string, string> = { LOW: 'badge-green', MEDIUM: 'badge-amber', HIGH: 'badge-red' }

function ReportCard({ report }: { report: Report }) {
  const [open, setOpen] = useState(false)
  const [detail, setDetail] = useState<ReportDetail | null>(null)
  const rec = REC[report.recommendation ?? 'WATCH'] ?? REC.WATCH
  const RecIcon = rec.icon

  const toggle = async () => {
    if (!open && !detail) setDetail(await sophiaApi.getReportDetail(report.id))
    setOpen(v => !v)
  }

  return (
    <motion.div className="card-hover" layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1">
          <div className="flex flex-wrap gap-1.5 mb-2">
            {report.token_symbol && <span className="badge-purple">${report.token_symbol}</span>}
            <span className={rec.badge + ' badge'}>
              <RecIcon className="w-3 h-3" /> {rec.label}
            </span>
            {report.risk_level && (
              <span className={RISK[report.risk_level] + ' badge'}>风险 {report.risk_level}</span>
            )}
            {report.confidence_score != null && (
              <span className="badge-cyan">置信度 {report.confidence_score}%</span>
            )}
          </div>
          <h3 className="text-sm font-semibold text-white">{report.title}</h3>
        </div>
        <span className="text-2xs text-ink-muted shrink-0">
          {new Date(report.published_at).toLocaleDateString('zh-CN')}
        </span>
      </div>

      <p className="text-xs text-ink-secondary leading-relaxed mb-3">{report.summary}</p>

      <button onClick={toggle}
        className="flex items-center gap-1 text-xs text-primary-400 hover:text-primary-300 transition-colors">
        {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        {open ? '收起报告' : '查看完整报告'}
      </button>

      <AnimatePresence>
        {open && detail && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }} className="overflow-hidden"
          >
            <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <pre className="whitespace-pre-wrap text-xs text-ink-secondary leading-relaxed font-mono rounded-lg p-4"
                   style={{ background: 'rgba(0,0,0,0.3)' }}>
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
      <PageHeader icon={FileText} title="投研报告" sub="由 Sophia 行长发布的 Meme 代币深度分析" />
      {isLoading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="card animate-pulse h-28" />)}
        </div>
      ) : reports.length === 0 ? (
        <Empty icon={FileText} msg="Sophia 行长正在撰写第一份投研报告…" />
      ) : (
        <div className="space-y-3">
          {reports.map(r => <ReportCard key={r.id} report={r} />)}
        </div>
      )}
    </div>
  )
}

function PageHeader({ icon: Icon, title, sub }: { icon: React.ElementType; title: string; sub: string }) {
  return (
    <motion.div className="flex items-center gap-3 mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="sophia-avatar w-9 h-9 text-sm">
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <h1 className="text-lg font-bold text-white">{title}</h1>
        <p className="text-xs text-ink-muted">{sub}</p>
      </div>
    </motion.div>
  )
}

function Empty({ icon: Icon, msg }: { icon: React.ElementType; msg: string }) {
  return (
    <div className="card flex flex-col items-center py-16 gap-3">
      <Icon className="w-10 h-10 text-ink-muted" />
      <p className="text-sm text-ink-muted">{msg}</p>
    </div>
  )
}
