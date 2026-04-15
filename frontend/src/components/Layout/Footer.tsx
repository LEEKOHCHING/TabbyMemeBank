import { Landmark, Shield, ExternalLink } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-bank-border bg-bank-surface mt-16">
      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-8">

        <div>
          <div className="flex items-center gap-2 mb-3">
            <Landmark className="w-5 h-5 text-tabby-500" />
            <span className="font-display font-bold text-white text-sm">TABBY MEME BANK</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            由 AI 行长 Sophia 管理的 BSC 链上 Meme 代币投资与 P2P 借贷平台。
          </p>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">功能</h4>
          <ul className="space-y-2 text-xs text-slate-500">
            <li>TABBY MEME 基金投资</li>
            <li>Meme 代币 P2P 借贷</li>
            <li>AI 投研报告</li>
            <li>Sophia 行长客服</li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">链上信息</h4>
          <ul className="space-y-2 text-xs text-slate-500">
            <li className="flex items-center gap-1">
              <Shield className="w-3 h-3 text-sophia-green" />
              <span>BSC 主网 (Chain ID: 56)</span>
            </li>
            <li>
              TABBY 合约：
              <a
                href={`https://bscscan.com/token/0x319558c8aD708dc42f45ab70eADA4750d6c942d7`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-tabby-400 hover:text-tabby-300 ml-1 inline-flex items-center gap-0.5"
              >
                0x3195...42d7 <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-bank-border px-4 py-3 flex flex-col sm:flex-row
                      items-center justify-between gap-2">
        <p className="text-xs text-slate-600">
          © 2026 TABBY MEME BANK. 投资有风险，入市需谨慎。
        </p>
        <p className="text-xs text-slate-600">
          Powered by <span className="text-tabby-500">AI Sophia</span> · BSC Chain
        </p>
      </div>
    </footer>
  )
}
