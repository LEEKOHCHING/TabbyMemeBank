import { Landmark, ExternalLink, Shield } from 'lucide-react'

export default function Footer() {
  return (
    <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }} className="mt-24">
      <div className="mx-auto max-w-7xl px-4 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">

        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="sophia-avatar w-6 h-6 text-xs">
              <Landmark className="w-3 h-3" />
            </div>
            <span className="text-sm font-semibold text-white">TABBY MEME BANK</span>
          </div>
          <p className="text-xs text-ink-muted leading-relaxed">
            由 AI 行长 Sophia 管理的 BSC 链上 Meme 代币投资与 P2P 借贷平台。
          </p>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-ink-secondary uppercase tracking-wider mb-3">功能</h4>
          <ul className="space-y-2 text-xs text-ink-muted">
            <li>TABBY MEME 基金投资</li>
            <li>Meme 代币 P2P 借贷</li>
            <li>AI 投研报告</li>
            <li>Sophia 行长客服</li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-ink-secondary uppercase tracking-wider mb-3">链上信息</h4>
          <ul className="space-y-2 text-xs text-ink-muted">
            <li className="flex items-center gap-1.5">
              <Shield className="w-3 h-3 text-green-400" />
              BSC 主网 (Chain ID: 56)
            </li>
            <li>
              TABBY 合约：
              <a
                href="https://bscscan.com/token/0x319558c8aD708dc42f45ab70eADA4750d6c942d7"
                target="_blank" rel="noopener noreferrer"
                className="text-primary-400 hover:text-primary-300 ml-1 inline-flex items-center gap-0.5 transition-colors"
              >
                0x3195…42d7 <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2"
           style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <p className="text-2xs text-ink-muted">© 2026 TABBY MEME BANK · 投资有风险，入市需谨慎</p>
        <p className="text-2xs text-ink-muted">Powered by <span className="text-primary-400">AI Sophia</span> · BSC Chain</p>
      </div>
    </footer>
  )
}
