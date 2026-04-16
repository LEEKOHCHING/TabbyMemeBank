import { ExternalLink, Shield } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function Footer() {
  const { t } = useTranslation()
  const features = t('footer.feature_list', { returnObjects: true }) as string[]

  return (
    <footer style={{ borderTop: '2px solid rgba(153,69,255,0.2)', marginTop: '6rem' }}>
      <div className="mx-auto max-w-7xl px-4 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* Brand */}
        <div>
          <div className="flex items-center gap-2.5 mb-3">
            <div className="sophia-avatar w-8 h-8 text-base">🐱</div>
            <span className="font-meme text-xl tracking-wide" style={{ letterSpacing: '0.05em' }}>
              <span className="text-white">TABBY </span>
              <span className="text-neon-green">MEME</span>
              <span className="text-white"> BANK</span>
            </span>
          </div>
          <p className="text-xs font-body leading-relaxed" style={{ color: '#6666aa' }}>{t('footer.tagline')}</p>
          <div className="flex gap-2 mt-3 flex-wrap">
            <span className="badge-purple font-meme tracking-wide text-xs">🔥 DEGEN</span>
            <span className="badge-green font-meme tracking-wide text-xs">🚀 WAGMI</span>
            <span className="badge-yellow font-meme tracking-wide text-xs">💎 HODL</span>
          </div>
        </div>

        {/* Features */}
        <div>
          <h4 className="font-meme text-base tracking-wide mb-3" style={{ color: '#9945ff', letterSpacing: '0.06em' }}>
            ⚡ {t('footer.features')}
          </h4>
          <ul className="space-y-2 text-xs font-body" style={{ color: '#6666aa' }}>
            {features.map((f, i) => (
              <li key={i} className="flex items-center gap-2">
                <span style={{ color: '#9945ff' }}>›</span> {f}
              </li>
            ))}
          </ul>
        </div>

        {/* Chain info */}
        <div>
          <h4 className="font-meme text-base tracking-wide mb-3" style={{ color: '#00d4ff', letterSpacing: '0.06em' }}>
            ⛓️ {t('footer.chain')}
          </h4>
          <ul className="space-y-2 text-xs font-body" style={{ color: '#6666aa' }}>
            <li className="flex items-center gap-1.5">
              <Shield className="w-3 h-3" style={{ color: '#00ff88' }} />
              <span style={{ color: '#c8c8e8' }}>{t('footer.bsc_mainnet')}</span>
            </li>
            <li>
              <span style={{ color: '#6666aa' }}>{t('footer.tabby_contract')}：</span>
              <a href="https://bscscan.com/token/0x319558c8aD708dc42f45ab70eADA4750d6c942d7"
                 target="_blank" rel="noopener noreferrer"
                 className="ml-1 inline-flex items-center gap-0.5 font-mono transition-colors"
                 style={{ color: '#9945ff' }}
                 onMouseEnter={e => (e.currentTarget.style.color = '#00ff88')}
                 onMouseLeave={e => (e.currentTarget.style.color = '#9945ff')}>
                0x3195…42d7 <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="mx-auto max-w-7xl px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2"
           style={{ borderTop: '1px solid rgba(153,69,255,0.1)' }}>
        <p className="text-xs font-body" style={{ color: '#4a4a6a' }}>{t('footer.copyright')}</p>
        <p className="text-xs font-body" style={{ color: '#4a4a6a' }}>
          {t('footer.powered')} <span style={{ color: '#9945ff' }}>AI Sophia 🐱</span>
          <span style={{ color: '#4a4a6a' }}> · BSC Chain 🚀</span>
        </p>
      </div>
    </footer>
  )
}
