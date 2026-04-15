import { useNavigate, useLocation } from 'react-router-dom'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import {
  TrendingUp, FileText, ArrowDownLeft, ArrowUpRight, MessageCircle, Landmark
} from 'lucide-react'
import { motion } from 'framer-motion'

const NAV_ITEMS = [
  { path: '/fund',     icon: TrendingUp,    label: 'MEME基金',  labelEn: 'Fund' },
  { path: '/research', icon: FileText,       label: '投研报告',  labelEn: 'Research' },
  { path: '/borrow',   icon: ArrowDownLeft,  label: '借贷',      labelEn: 'Borrow' },
  { path: '/lend',     icon: ArrowUpRight,   label: '放贷',      labelEn: 'Lend' },
  { path: '/chat',     icon: MessageCircle,  label: '客服',      labelEn: 'Chat' },
]

export default function Header() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  return (
    <header className="sticky top-0 z-50 border-b border-bank-border bg-bank-bg/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">

        {/* Logo */}
        <motion.div
          className="flex items-center gap-2 cursor-pointer shrink-0"
          onClick={() => navigate('/')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-tabby-500 to-sophia-purple
                          flex items-center justify-center glow-orange">
            <Landmark className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-display font-bold text-sm text-white leading-none">
              TABBY MEME
            </div>
            <div className="font-display font-bold text-sm text-gradient leading-none">
              BANK
            </div>
          </div>
        </motion.div>

        {/* Navigation */}
        <nav className="flex items-center gap-1">
          {NAV_ITEMS.map(({ path, icon: Icon, label }) => (
            <motion.button
              key={path}
              onClick={() => navigate(path)}
              className={`nav-item ${pathname === path ? 'active' : ''}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Icon className="w-5 h-5" />
              <span className="hidden sm:block">{label}</span>
            </motion.button>
          ))}
        </nav>

        {/* Wallet Connect */}
        <div className="shrink-0">
          <ConnectButton
            chainStatus="icon"
            showBalance={false}
            accountStatus="avatar"
          />
        </div>
      </div>
    </header>
  )
}
