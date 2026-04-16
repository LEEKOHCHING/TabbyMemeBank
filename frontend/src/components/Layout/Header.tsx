import { useNavigate, useLocation } from 'react-router-dom'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { TrendingUp, FileText, ArrowDownLeft, ArrowUpRight, MessageCircle, Landmark } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'

const NAV_KEYS = [
  { path: '/fund',     icon: TrendingUp,   key: 'nav.fund'     },
  { path: '/research', icon: FileText,      key: 'nav.research' },
  { path: '/borrow',   icon: ArrowDownLeft, key: 'nav.borrow'   },
  { path: '/lend',     icon: ArrowUpRight,  key: 'nav.lend'     },
  { path: '/chat',     icon: MessageCircle, key: 'nav.chat'     },
]

function LangToggle() {
  const { i18n } = useTranslation()
  const isEN = i18n.language === 'en'

  return (
    <button
      onClick={() => i18n.changeLanguage(isEN ? 'zh' : 'en')}
      className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all duration-150"
      style={{
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        color: '#a1a1aa',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'rgba(139,92,246,0.4)'
        e.currentTarget.style.color = '#fff'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
        e.currentTarget.style.color = '#a1a1aa'
      }}
      title={isEN ? '切换中文' : 'Switch to English'}
    >
      <span style={{ opacity: isEN ? 1 : 0.45 }}>EN</span>
      <span className="text-ink-muted mx-0.5">/</span>
      <span style={{ opacity: isEN ? 0.45 : 1 }}>中</span>
    </button>
  )
}

export default function Header() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { t } = useTranslation()

  return (
    <header
      className="sticky top-0 z-50 w-full"
      style={{
        background: 'rgba(10,10,10,0.85)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4">

        {/* Logo */}
        <motion.button
          onClick={() => navigate('/')}
          className="flex items-center gap-2.5 shrink-0"
          whileTap={{ scale: 0.97 }}
        >
          <div className="sophia-avatar w-7 h-7 text-xs">
            <Landmark className="w-3.5 h-3.5" />
          </div>
          <span className="hidden sm:block text-sm font-semibold text-white tracking-tight">
            TABBY MEME <span className="text-gradient">BANK</span>
          </span>
        </motion.button>

        {/* Nav */}
        <nav className="flex items-center gap-0.5">
          {NAV_KEYS.map(({ path, icon: Icon, key }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`nav-item text-xs ${pathname === path ? 'active' : ''}`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden md:block">{t(key)}</span>
            </button>
          ))}
        </nav>

        {/* Right: Lang + Wallet */}
        <div className="flex items-center gap-2 shrink-0">
          <LangToggle />
          <ConnectButton chainStatus="icon" showBalance={false} accountStatus="avatar" />
        </div>
      </div>
    </header>
  )
}
