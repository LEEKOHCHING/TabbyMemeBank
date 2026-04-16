import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { TrendingUp, FileText, ArrowDownLeft, ArrowUpRight, MessageCircle, ChevronRight, Sparkles } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import DataCards from '../components/Dashboard/DataCards'
import SophiaLiveShow from '../components/LiveShow/SophiaLiveShow'

const ACTION_DEFS = [
  { path: '/fund',     icon: TrendingUp,   key: 'fund',     color: 'rgba(139,92,246,0.15)', border: 'rgba(139,92,246,0.25)', iconColor: '#c084fc' },
  { path: '/research', icon: FileText,      key: 'research', color: 'rgba(99,102,241,0.15)',  border: 'rgba(99,102,241,0.25)',  iconColor: '#818cf8' },
  { path: '/borrow',   icon: ArrowDownLeft, key: 'borrow',   color: 'rgba(6,182,212,0.1)',    border: 'rgba(6,182,212,0.2)',    iconColor: '#22d3ee' },
  { path: '/lend',     icon: ArrowUpRight,  key: 'lend',     color: 'rgba(34,197,94,0.1)',    border: 'rgba(34,197,94,0.2)',    iconColor: '#4ade80' },
  { path: '/chat',     icon: MessageCircle, key: 'chat',     color: 'rgba(245,158,11,0.1)',   border: 'rgba(245,158,11,0.2)',   iconColor: '#fbbf24' },
]

export default function Home() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  return (
    <div className="relative min-h-screen">
      {/* Purple glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 -top-40 h-[600px] w-[800px] -translate-x-1/2 rounded-full opacity-30"
             style={{ background: 'radial-gradient(ellipse, rgba(139,92,246,0.35) 0%, transparent 70%)' }} />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-12 space-y-14">

        {/* Hero */}
        <motion.section className="text-center space-y-5"
          initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium"
               style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', color: '#4ade80' }}>
            <span className="live-dot" /> {t('home.badge')}
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            <span className="text-white">{t('home.title1')}</span>
            <span className="text-gradient">{t('home.title2')}</span>
          </h1>
          <p className="mx-auto max-w-xl text-base text-ink-secondary">
            {t('home.subtitle').replace('Sophia', '')}
            <span className="text-gradient-gold font-semibold">Sophia</span>
            {' '}{t('home.subtitle').split('Sophia')[1] || ''}
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button className="btn-primary px-5 py-2.5 text-sm flex items-center gap-2" onClick={() => navigate('/fund')}>
              <Sparkles className="w-4 h-4" /> {t('home.cta_invest')}
            </button>
            <button className="btn-outline px-5 py-2.5 text-sm" onClick={() => navigate('/chat')}>
              {t('home.cta_chat')}
            </button>
          </div>
        </motion.section>

        {/* Stats */}
        <section>
          <SectionTitle dot="purple">{t('home.section_stats')}</SectionTitle>
          <DataCards />
        </section>

        {/* Live */}
        <section>
          <SectionTitle dot="gold">{t('home.section_live')}</SectionTitle>
          <SophiaLiveShow />
        </section>

        {/* Actions */}
        <section>
          <SectionTitle dot="cyan">{t('home.section_actions')}</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {ACTION_DEFS.map(({ path, icon: Icon, key, color, border, iconColor }, i) => (
              <motion.button key={path} onClick={() => navigate(path)}
                className="group text-left rounded-xl p-4 transition-all duration-200"
                style={{ background: color, border: `1px solid ${border}` }}
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}
              >
                <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg"
                     style={{ background: 'rgba(0,0,0,0.3)', color: iconColor }}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="text-sm font-semibold text-white mb-1">{t(`home.actions.${key}.label`)}</div>
                <div className="text-xs text-ink-muted leading-relaxed mb-3">{t(`home.actions.${key}.desc`)}</div>
                <div className="flex items-center gap-1 text-xs" style={{ color: iconColor }}>
                  {t('home.enter')} <ChevronRight className="w-3 h-3" />
                </div>
              </motion.button>
            ))}
          </div>
        </section>

        {/* Risk */}
        <div className="rounded-xl px-4 py-3 text-center text-xs text-ink-muted"
             style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)' }}>
          <span className="text-red-400 font-medium">{t('home.risk_title')}: </span>
          {t('home.risk_text')}
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
