import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { TrendingUp, ExternalLink, Wallet, BarChart3, AlertTriangle } from 'lucide-react'
import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import toast from 'react-hot-toast'
import { fundApi, FundStats, Portfolio, FundTx } from '../services/api'
import { formatUSD, formatBNB, SOPHIA_ADDRESS } from '../services/web3'

export default function MemeFundPage() {
  const { address, isConnected } = useAccount()
  const qc = useQueryClient()
  const [amount, setAmount]   = useState('')
  const [txHash, setTxHash]   = useState('')

  const { data: stats }     = useQuery<FundStats>({ queryKey: ['fund-stats'],     queryFn: fundApi.getStats,           refetchInterval: 30_000 })
  const { data: portfolio } = useQuery<Portfolio>({ queryKey: ['fund-portfolio'],  queryFn: fundApi.getPortfolio,       refetchInterval: 60_000 })
  const { data: txs = [] }  = useQuery<FundTx[]>({ queryKey: ['fund-txs'],        queryFn: () => fundApi.getTransactions(20), refetchInterval: 30_000 })
  const { data: mine }      = useQuery({ queryKey: ['my-investment', address], queryFn: () => fundApi.getMyInvestment(address!), enabled: !!address })

  const invest = useMutation({
    mutationFn: () => fundApi.invest({ wallet_address: address!, amount_bnb: parseFloat(amount), tx_hash: txHash }),
    onSuccess: (r) => { toast.success(r.message); qc.invalidateQueries({ queryKey: ['fund-stats'] }); setAmount(''); setTxHash('') },
    onError: (e: Error) => toast.error(e.message),
  })

  const pnl = stats?.total_profit_loss_usd ?? 0

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <PageHeader />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left */}
        <div className="lg:col-span-2 space-y-5">
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: '管理规模', value: `${(stats?.total_invested_bnb ?? 0).toFixed(3)} BNB`, icon: Wallet },
              { label: '组合市值', value: formatUSD(stats?.total_portfolio_value_usd ?? 0), icon: BarChart3 },
              { label: '累计盈亏', value: formatUSD(Math.abs(pnl)), icon: TrendingUp, green: pnl >= 0 },
              { label: '投资人数', value: String(stats?.num_investors ?? 0), icon: Wallet },
            ].map(({ label, value, icon: Icon, green }, i) => (
              <motion.div key={label} className="stat-card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="stat-label">{label}</span>
                  <Icon className="w-3.5 h-3.5 text-primary-400" />
                </div>
                <div className={`stat-value text-base ${green !== undefined ? (green ? 'text-green-400' : 'text-red-400') : ''}`}>{value}</div>
              </motion.div>
            ))}
          </div>

          {/* Portfolio */}
          {portfolio && (
            <div className="card">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary-400" /> Sophia 当前持仓
              </h3>
              <div className="space-y-2">
                <Row label="BNB (现金)" value={formatBNB(portfolio.bnb_balance)} />
                {portfolio.tokens.map(t => <Row key={t.symbol} label={`$${t.symbol}`} value={t.balance.toLocaleString()} />)}
              </div>
              <div className="mt-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <a href={`https://bscscan.com/address/${SOPHIA_ADDRESS}`} target="_blank" rel="noopener noreferrer"
                   className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1 transition-colors">
                  BSCScan 查看钱包 <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}

          {/* Tx history */}
          <div className="card">
            <h3 className="text-sm font-semibold text-white mb-3">Sophia 操盘记录</h3>
            {txs.length === 0 ? (
              <p className="text-xs text-ink-muted text-center py-6">暂无交易记录</p>
            ) : txs.map(tx => (
              <div key={tx.id} className="flex items-center gap-3 py-2 text-xs"
                   style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <span className={`w-16 font-medium ${tx.tx_type === 'buy' ? 'text-green-400' : tx.tx_type === 'sell' ? 'text-red-400' : 'text-cyan-400'}`}>
                  {{ buy:'买入', sell:'卖出', add_liquidity:'加池', remove_liquidity:'撤池' }[tx.tx_type] ?? tx.tx_type}
                </span>
                <span className="badge-purple">${tx.token_symbol}</span>
                <span className="flex-1 text-ink-muted truncate">{tx.description ?? '—'}</span>
                <span className="font-mono text-ink-secondary">{tx.amount.toLocaleString()}</span>
                {tx.tx_hash && (
                  <a href={`https://bscscan.com/tx/${tx.tx_hash}`} target="_blank" rel="noopener noreferrer"
                     className="text-primary-400 hover:text-primary-300">
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right */}
        <div className="space-y-4">
          {isConnected ? (
            <>
              {mine && mine.total_invested_bnb > 0 && (
                <div className="card" style={{ borderColor: 'rgba(139,92,246,0.25)' }}>
                  <p className="text-2xs text-ink-muted mb-1">我的投资</p>
                  <div className="text-xl font-bold text-white">{formatBNB(mine.total_invested_bnb)}</div>
                  <div className="text-xs text-ink-muted">{mine.num_transactions} 笔记录</div>
                </div>
              )}

              <div className="card">
                <h3 className="text-sm font-semibold text-white mb-4">投资基金</h3>
                <div className="rounded-lg p-3 mb-4 text-xs text-amber-300 leading-relaxed"
                     style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.2)' }}>
                  <AlertTriangle className="w-3.5 h-3.5 inline mr-1.5" />
                  请先将 BNB 转入 Sophia 钱包：
                  <div className="font-mono mt-1 break-all text-2xs">{SOPHIA_ADDRESS}</div>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-2xs text-ink-muted block mb-1">投资金额 (BNB)</label>
                    <input className="input" type="number" step="0.001" placeholder="0.1" value={amount} onChange={e => setAmount(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-2xs text-ink-muted block mb-1">转账 TX Hash</label>
                    <input className="input font-mono" placeholder="0x…" value={txHash} onChange={e => setTxHash(e.target.value)} />
                  </div>
                  <button className="btn-primary w-full" disabled={!amount || !txHash || invest.isPending} onClick={() => invest.mutate()}>
                    {invest.isPending ? '确认中…' : '确认投资'}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="card flex flex-col items-center py-10 gap-3">
              <TrendingUp className="w-8 h-8 text-primary-400" />
              <p className="text-sm font-medium text-white">连接钱包以投资</p>
              <p className="text-xs text-ink-muted text-center">加入 TABBY MEME 基金，让 Sophia 为您操盘</p>
              <ConnectButton />
            </div>
          )}
          <div className="rounded-xl px-3 py-2.5 text-xs text-ink-muted"
               style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)' }}>
            <span className="text-red-400 font-medium">风险提示：</span>
            Meme 代币价格波动极大，投资可能损失全部本金。
          </div>
        </div>
      </div>
    </div>
  )
}

function PageHeader() {
  return (
    <motion.div className="flex items-center gap-3 mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="sophia-avatar w-9 h-9 text-sm"><TrendingUp className="w-4 h-4" /></div>
      <div>
        <h1 className="text-lg font-bold text-white">TABBY MEME 基金</h1>
        <p className="text-xs text-ink-muted">由 Sophia 行长主动管理的 BSC Meme 代币基金</p>
      </div>
    </motion.div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-xs">
      <span className="text-ink-muted">{label}</span>
      <span className="font-mono text-ink-secondary">{value}</span>
    </div>
  )
}
