import { useNavigate, useLocation } from 'react-router-dom'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { TrendingUp, FileText, ArrowDownLeft, ArrowUpRight, MessageCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'

const NAV = [
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
      className="rounded-lg px-2.5 py-1 text-xs font-bold transition-all duration-200"
      style={{
        background: 'rgba(153,69,255,0.12)',
        border: '1px solid rgba(153,69,255,0.3)',
        color: '#bb77ff',
        fontFamily: 'Space Grotesk, sans-serif',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = '#9945ff'; e.currentTarget.style.boxShadow = '0 0 12px rgba(153,69,255,0.4)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(153,69,255,0.3)'; e.currentTarget.style.boxShadow = 'none' }}
    >
      <span style={{ opacity: isEN ? 1 : 0.4 }}>EN</span>
      <span className="mx-1" style={{ color: '#4a4a6a' }}>/</span>
      <span style={{ opacity: isEN ? 0.4 : 1 }}>中</span>
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
        background: 'rgba(13,13,26,0.92)',
        borderBottom: '2px solid #1e1e40',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4">

        {/* Logo */}
        <motion.button
          onClick={() => navigate('/')}
          className="flex items-center gap-2.5 shrink-0"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <div className="sophia-avatar w-9 h-9 text-base font-meme">🐱</div>
          <div className="hidden sm:block">
            <div className="font-meme text-xl leading-none tracking-wide" style={{ letterSpacing: '0.05em' }}>
              <span className="text-white">TABBY </span>
              <span className="text-neon-green">MEME</span>
              <span className="text-white"> BANK</span>
            </div>
            <div className="text-xs font-body" style={{ color: '#6666aa' }}>Est. 2026 • BSC Chain 🚀</div>
          </div>
        </motion.button>

        {/* Nav */}
        <nav className="flex items-center gap-0.5">
          {NAV.map(({ path, icon: Icon, key }) => (
            <motion.button
              key={path}
              onClick={() => navigate(path)}
              className={`nav-item text-xs ${pathname === path ? 'active' : ''}`}
              whileTap={{ scale: 0.95 }}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden md:block">{t(key)}</span>
            </motion.button>
          ))}
        </nav>

        {/* Right */}
        <div className="flex items-center gap-2 shrink-0">
          <LangToggle />
          <ConnectButton chainStatus="icon" showBalance={false} accountStatus="avatar" />
        </div>
      </div>
    </header>
  )
}
