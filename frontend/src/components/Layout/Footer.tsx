import { Landmark, ExternalLink, Shield } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function Footer() {
  const { t } = useTranslation()
  const features = t('footer.feature_list', { returnObjects: true }) as string[]

  return (
    <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }} className="mt-24">
      <div className="mx-auto max-w-7xl px-4 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="sophia-avatar w-6 h-6 text-xs"><Landmark className="w-3 h-3" /></div>
            <span className="text-sm font-semibold text-white">TABBY MEME BANK</span>
          </div>
          <p className="text-xs text-ink-muted leading-relaxed">{t('footer.tagline')}</p>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-ink-secondary uppercase tracking-wider mb-3">{t('footer.features')}</h4>
          <ul className="space-y-2 text-xs text-ink-muted">
            {features.map((f, i) => <li key={i}>{f}</li>)}
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-ink-secondary uppercase tracking-wider mb-3">{t('footer.chain')}</h4>
          <ul className="space-y-2 text-xs text-ink-muted">
            <li className="flex items-center gap-1.5">
              <Shield className="w-3 h-3 text-green-400" /> {t('footer.bsc_mainnet')}
            </li>
            <li>
              {t('footer.tabby_contract')}：
              <a href="https://bscscan.com/token/0x319558c8aD708dc42f45ab70eADA4750d6c942d7"
                 target="_blank" rel="noopener noreferrer"
                 className="text-primary-400 hover:text-primary-300 ml-1 inline-flex items-center gap-0.5 transition-colors">
                0x3195…42d7 <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2"
           style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <p className="text-2xs text-ink-muted">{t('footer.copyright')}</p>
        <p className="text-2xs text-ink-muted">{t('footer.powered')} <span className="text-primary-400">AI Sophia</span> · BSC Chain</p>
      </div>
    </footer>
  )
}
