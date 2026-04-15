import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, TrendingUp, TrendingDown, Minus, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react'
import { sophiaApi, Report, ReportDetail } from '../services/api'

const RECOMMENDATION_CONFIG = {
  BUY:   { color: 'badge-green',  icon: TrendingUp,   label: '建议买入' },
  SELL:  { color: 'badge-red',    icon: TrendingDown,  label: '建议卖出' },
  HOLD:  { color: 'badge-gold',   icon: Minus,         label: '建议持有' },
  WATCH: { color: 'badge-purple', icon: AlertTriangle, label: '观望' },
}

const RISK_CONFIG = {
  LOW:    'badge-green',
  MEDIUM: 'badge-gold',
  HIGH:   'badge-red',
}

function ReportCard({ report }: { report: Report }) {
  const [expanded, setExpanded] = useState(false)
  const [detail, setDetail] = useState<ReportDetail | null>(null)

  const rec = RECOMMENDATION_CONFIG[report.recommendation as keyof typeof RECOMMENDATION_CONFIG]
    || RECOMMENDATION_CONFIG.WATCH
  const RecIcon = rec.icon
  const riskColor = RISK_CONFIG[report.risk_level as keyof typeof RISK_CONFIG] || 'badge-gold'

  const loadDetail = async () => {
    if (!expanded && !detail) {
      const d = await sophiaApi.getReportDetail(report.id)
      setDetail(d)
    }
    setExpanded(v => !v)
  }

  return (
    <motion.div
      className="card hover:border-bank-muted transition-colors duration-200"
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            {report.token_symbol && (
              <span className="badge badge-purple">${report.token_symbol}</span>
            )}
            <span className={rec.color + ' badge'}>
              <RecIcon className="w-3 h-3" /> {rec.label}
            </span>
            {report.risk_level && (
              <span className={riskColor + ' badge'}>风险 {report.risk_level}</span>
            )}
            {report.confidence_score != null && (
              <span className="badge badge-cyan">置信度 {report.confidence_score}%</span>
            )}
          </div>
          <h3 className="font-semibold text-white text-sm leading-snug">{report.title}</h3>
        </div>
        <span className="text-xs text-slate-600 shrink-0">
          {new Date(report.published_at).toLocaleDateString('zh-CN')}
        </span>
      </div>

      <p className="text-xs text-slate-400 leading-relaxed mb-3">{report.summary}</p>

      <button
        onClick={loadDetail}
        className="flex items-center gap-1 text-xs text-tabby-400 hover:text-tabby-300 transition-colors"
      >
        {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        {expanded ? '收起报告' : '查看完整报告'}
      </button>

      <AnimatePresence>
        {expanded && detail && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 pt-4 border-t border-bank-border">
              <div className="prose prose-invert prose-sm max-w-none">
                <pre className="whitespace-pre-wrap text-xs text-slate-300 leading-relaxed font-mono bg-bank-bg rounded-lg p-4">
                  {detail.full_report}
                </pre>
              </div>
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
    <div className="max-w-5xl mx-auto px-4 py-8">
      <motion.div
        className="flex items-center gap-3 mb-8"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sophia-purple to-violet-700
                        flex items-center justify-center">
          <FileText className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-display font-bold text-white text-xl">投研报告</h1>
          <p className="text-xs text-slate-500">由 Sophia 行长发布的 Meme 代币深度分析报告</p>
        </div>
      </motion.div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card animate-pulse h-32" />
          ))}
        </div>
      ) : reports.length === 0 ? (
        <div className="card text-center py-16">
          <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-500">Sophia 行长正在撰写第一份投研报告，请稍候...</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map(r => <ReportCard key={r.id} report={r} />)}
        </div>
      )}
    </div>
  )
}
