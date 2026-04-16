import { useNavigate, useLocation } from 'react-router-dom'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { TrendingUp, FileText, ArrowDownLeft, ArrowUpRight, MessageCircle, Landmark } from 'lucide-react'
import { motion } from 'framer-motion'

const NAV = [
  { path: '/fund',     icon: TrendingUp,   label: 'MEME基金' },
  { path: '/research', icon: FileText,      label: '投研报告' },
  { path: '/borrow',   icon: ArrowDownLeft, label: '借贷'     },
  { path: '/lend',     icon: ArrowUpRight,  label: '放贷'     },
  { path: '/chat',     icon: MessageCircle, label: '客服'     },
]

export default function Header() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  return (
    <header
      className="sticky top-0 z-50 w-full"
      style={{
        background: 'rgba(10,10,10,0.8)',
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
          <div
            className="sophia-avatar w-7 h-7 text-xs"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
          >
            <Landmark className="w-3.5 h-3.5" />
          </div>
          <span className="hidden sm:block text-sm font-semibold text-white tracking-tight">
            TABBY MEME <span className="text-gradient">BANK</span>
          </span>
        </motion.button>

        {/* Nav */}
        <nav className="flex items-center gap-0.5">
          {NAV.map(({ path, icon: Icon, label }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`nav-item text-xs ${pathname === path ? 'active' : ''}`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden md:block">{label}</span>
            </button>
          ))}
        </nav>

        {/* Wallet */}
        <div className="shrink-0">
          <ConnectButton chainStatus="icon" showBalance={false} accountStatus="avatar" />
        </div>
      </div>
    </header>
  )
}
