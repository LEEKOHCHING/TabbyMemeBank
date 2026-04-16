import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { TrendingUp, FileText, ArrowDownLeft, ArrowUpRight, MessageCircle, ChevronRight, Rocket } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import DataCards from '../components/Dashboard/DataCards'
import SophiaLiveShow from '../components/LiveShow/SophiaLiveShow'

const ACTIONS = [
  { path: '/fund',     icon: '💰', lucide: TrendingUp,   key: 'fund',     border: '#9945ff', glow: 'rgba(153,69,255,0.25)' },
  { path: '/research', icon: '📊', lucide: FileText,      key: 'research', border: '#00d4ff', glow: 'rgba(0,212,255,0.25)' },
  { path: '/borrow',   icon: '🏦', lucide: ArrowDownLeft, key: 'borrow',   border: '#ff2d78', glow: 'rgba(255,45,120,0.25)' },
  { path: '/lend',     icon: '🤑', lucide: ArrowUpRight,  key: 'lend',     border: '#00ff88', glow: 'rgba(0,255,136,0.25)' },
  { path: '/chat',     icon: '🤖', lucide: MessageCircle, key: 'chat',     border: '#ffe600', glow: 'rgba(255,230,0,0.25)' },
]

const TICKER_ITEMS = [
  '🐱 TABBY TO THE MOON', '🚀 WAGMI', '💎 HOLD STRONG', '🔥 MEME SZNS NEVER END',
  '🐸 PEPE APPROVES', '🦴 MUCH WOW VERY GAIN', '💰 TABBY MEME BANK', '🌙 1000X INCOMING',
]

export default function Home() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  return (
    <div className="relative min-h-screen">

      {/* Ticker tape */}
      <div className="overflow-hidden py-2" style={{ background: 'linear-gradient(90deg,#9945ff,#ff2d78,#00d4ff,#00ff88,#ffe600,#9945ff)', backgroundSize: '400% 100%', animation: 'rainbow 6s linear infinite' }}>
        <div className="flex gap-8 whitespace-nowrap font-meme text-black text-sm tracking-widest"
             style={{ animation: 'marquee 20s linear infinite' }}>
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span key={i} className="shrink-0">{item}</span>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
      `}</style>

      <div className="mx-auto max-w-7xl px-4 py-12 space-y-14">

        {/* Hero */}
        <motion.section className="text-center space-y-6"
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>

          {/* Sophia mascot */}
          <motion.div className="mx-auto w-24 h-24 rounded-full flex items-center justify-center text-5xl sophia-avatar animate-float"
            animate={{ rotate: [0, -5, 5, -5, 0] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}>
            🐱
          </motion.div>

          <div>
            <h1 className="font-meme text-7xl md:text-9xl leading-none tracking-wide" style={{ letterSpacing: '0.04em' }}>
              <span className="text-rainbow">TABBY MEME</span>
              <br />
              <span className="text-white">BANK</span>
            </h1>
            <p className="mt-3 text-base font-body" style={{ color: '#8888aa' }}>
              {t('home.subtitle').split('Sophia')[0]}
              <span className="text-neon-yellow font-bold"> Sophia </span>
              {t('home.subtitle').split('Sophia')[1] || ''}
            </p>
          </div>

          {/* Live badge */}
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 font-body font-semibold text-sm"
                 style={{ background: 'rgba(0,255,136,0.1)', border: '1px solid rgba(0,255,136,0.35)', color: '#00ff88' }}>
              <span className="live-dot" /> {t('home.badge')}
            </div>
            <div className="badge-purple font-meme tracking-wider">🔥 DEGEN APPROVED</div>
            <div className="badge-yellow font-meme tracking-wider">🚀 WAGMI</div>
          </div>

          {/* CTAs */}
          <div className="flex items-center justify-center gap-4 flex-wrap pt-2">
            <motion.button className="btn-meme flex items-center gap-2 text-base px-8 py-3 font-meme tracking-wide"
              onClick={() => navigate('/fund')} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Rocket className="w-5 h-5" /> {t('home.cta_invest')} 🚀
            </motion.button>
            <motion.button className="btn-pink flex items-center gap-2 text-base px-8 py-3 font-meme tracking-wide"
              onClick={() => navigate('/chat')} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              🤖 {t('home.cta_chat')}
            </motion.button>
          </div>
        </motion.section>

        {/* Stats */}
        <section>
          <SectionTitle emoji="📈">{t('home.section_stats')}</SectionTitle>
          <DataCards />
        </section>

        {/* Live Show */}
        <section>
          <SectionTitle emoji="🎬">{t('home.section_live')}</SectionTitle>
          <SophiaLiveShow />
        </section>

        {/* Quick Actions */}
        <section>
          <SectionTitle emoji="⚡">{t('home.section_actions')}</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {ACTIONS.map(({ path, icon, key, border, glow }, i) => (
              <motion.button key={path} onClick={() => navigate(path)}
                className="text-left rounded-2xl p-5 transition-all duration-200 group"
                style={{ background: '#12122a', border: `2px solid ${border}40`, boxShadow: `0 0 20px ${glow}` }}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                whileHover={{ scale: 1.04, y: -4, boxShadow: `0 0 30px ${glow}` }}
                whileTap={{ scale: 0.97 }}
                onMouseEnter={e => e.currentTarget.style.borderColor = border}
                onMouseLeave={e => e.currentTarget.style.borderColor = `${border}40`}
              >
                <div className="text-4xl mb-3 group-hover:animate-wiggle inline-block">{icon}</div>
                <div className="font-meme text-xl text-white mb-1 tracking-wide">{t(`home.actions.${key}.label`)}</div>
                <div className="text-xs font-body mb-4" style={{ color: '#6666aa' }}>{t(`home.actions.${key}.desc`)}</div>
                <div className="flex items-center gap-1 text-xs font-bold font-body" style={{ color: border }}>
                  {t('home.enter')} <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </motion.button>
            ))}
          </div>
        </section>

        {/* Risk disclaimer */}
        <div className="rounded-2xl px-5 py-4 text-center text-sm font-body"
             style={{ background: 'rgba(255,45,120,0.05)', border: '2px solid rgba(255,45,120,0.2)' }}>
          <span className="text-neon-pink font-bold">⚠️ {t('home.risk_title')}: </span>
          <span style={{ color: '#8888aa' }}>{t('home.risk_text')}</span>
        </div>
      </div>
    </div>
  )
}

function SectionTitle({ children, emoji }: { children: React.ReactNode; emoji: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <span className="text-2xl">{emoji}</span>
      <h2 className="font-meme text-2xl text-white tracking-wide" style={{ letterSpacing: '0.05em' }}>{children}</h2>
      <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, #2a2a55, transparent)' }} />
    </div>
  )
}
