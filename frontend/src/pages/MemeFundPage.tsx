import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { TrendingUp, ExternalLink, Wallet, BarChart3, AlertTriangle } from 'lucide-react'
import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import toast from 'react-hot-toast'
import { fundApi, FundStats, Portfolio, FundTx } from '../services/api'
import { formatUSD, formatBNB, SOPHIA_ADDRESS } from '../services/web3'
import { useTranslation } from 'react-i18next'

const STAT_CARDS = [
  { key: 'total_invested_bnb',         label: '💰 AUM',           emoji: '💸', neon: '#9945ff', glow: 'rgba(153,69,255,0.2)' },
  { key: 'total_portfolio_value_usd',  label: '📊 Portfolio',     emoji: '📈', neon: '#00d4ff', glow: 'rgba(0,212,255,0.2)'  },
  { key: 'total_profit_loss_usd',      label: '🚀 P&L',           emoji: '💹', neon: '#00ff88', glow: 'rgba(0,255,136,0.2)'  },
  { key: 'num_investors',              label: '👥 Investors',     emoji: '🧑‍🚀', neon: '#ff2d78', glow: 'rgba(255,45,120,0.2)' },
]

const TX_EMOJI: Record<string, string> = { buy: '🚀', sell: '📉', add_liquidity: '💧', remove_liquidity: '🔄' }
const TX_LABEL: Record<string, string> = { buy: 'BUY', sell: 'SELL', add_liquidity: 'ADD LIQ', remove_liquidity: 'REM LIQ' }
const TX_NEON:  Record<string, string> = { buy: '#00ff88', sell: '#ff2d78', add_liquidity: '#00d4ff', remove_liquidity: '#ffe600' }

export default function MemeFundPage() {
  const { address, isConnected } = useAccount()
  const { t } = useTranslation()
  const qc = useQueryClient()
  const [amount, setAmount] = useState('')
  const [txHash, setTxHash] = useState('')

  const { data: stats }     = useQuery<FundStats>({ queryKey: ['fund-stats'],    queryFn: fundApi.getStats,                 refetchInterval: 30_000 })
  const { data: portfolio } = useQuery<Portfolio>({ queryKey: ['fund-portfolio'], queryFn: fundApi.getPortfolio,             refetchInterval: 60_000 })
  const { data: txs = [] }  = useQuery<FundTx[]>({ queryKey: ['fund-txs'],       queryFn: () => fundApi.getTransactions(20), refetchInterval: 30_000 })
  const { data: mine }      = useQuery({ queryKey: ['my-investment', address], queryFn: () => fundApi.getMyInvestment(address!), enabled: !!address })

  const invest = useMutation({
    mutationFn: () => fundApi.invest({ wallet_address: address!, amount_bnb: parseFloat(amount), tx_hash: txHash }),
    onSuccess: (r) => { toast.success(r.message); qc.invalidateQueries({ queryKey: ['fund-stats'] }); setAmount(''); setTxHash('') },
    onError: (e: Error) => toast.error(e.message),
  })

  const pnl = stats?.total_profit_loss_usd ?? 0

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">

      {/* Page Header */}
      <motion.div className="flex items-center gap-4 mb-8" initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="sophia-avatar w-12 h-12 text-2xl animate-float">💰</div>
        <div>
          <h1 className="font-meme text-4xl text-white tracking-wide" style={{ letterSpacing: '0.05em' }}>
            TABBY <span className="text-neon-green">MEME</span> FUND
          </h1>
          <p className="text-sm font-body mt-1" style={{ color: '#6666aa' }}>
            🤖 Actively managed by AI President Sophia on BSC
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left panel */}
        <div className="lg:col-span-2 space-y-5">

          {/* Stat cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {STAT_CARDS.map(({ key, label, emoji, neon, glow }, i) => {
              let value = '—'
              if (key === 'total_invested_bnb')        value = `${(stats?.total_invested_bnb ?? 0).toFixed(3)} BNB`
              else if (key === 'total_portfolio_value_usd') value = formatUSD(stats?.total_portfolio_value_usd ?? 0)
              else if (key === 'total_profit_loss_usd')    value = formatUSD(Math.abs(pnl))
              else if (key === 'num_investors')            value = `${stats?.num_investors ?? 0}`

              return (
                <motion.div key={key}
                  className="rounded-2xl p-4 flex flex-col gap-1"
                  style={{ background: '#12122a', border: `2px solid ${neon}30`, boxShadow: `0 0 14px ${glow}` }}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  whileHover={{ scale: 1.04, boxShadow: `0 0 24px ${glow}` }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-body font-semibold uppercase tracking-widest" style={{ color: '#6666aa' }}>{label}</span>
                    <span className="text-base">{emoji}</span>
                  </div>
                  <div className="font-meme text-xl text-white" style={{ letterSpacing: '0.03em' }}>{value}</div>
                  {key === 'total_profit_loss_usd' && (
                    <div className={`text-xs font-body font-semibold ${pnl >= 0 ? 'text-neon-green' : 'text-neon-pink'}`}>
                      {pnl >= 0 ? '▲' : '▼'} {stats?.profit_loss_pct?.toFixed(2) ?? 0}%
                    </div>
                  )}
                </motion.div>
              )
            })}
          </div>

          {/* Portfolio holdings */}
          {portfolio && (
            <div className="rounded-2xl p-5" style={{ background: '#12122a', border: '2px solid rgba(0,212,255,0.25)' }}>
              <h3 className="font-meme text-xl text-white mb-4 tracking-wide flex items-center gap-2">
                <BarChart3 className="w-5 h-5" style={{ color: '#00d4ff' }} />
                <span style={{ color: '#00d4ff' }}>SOPHIA'S HOLDINGS</span>
              </h3>
              <div className="space-y-2">
                <PortfolioRow label="🏦 BNB (Cash)" value={formatBNB(portfolio.bnb_balance)} neon="#ffe600" />
                {portfolio.tokens.map(t => (
                  <PortfolioRow key={t.symbol} label={`🪙 $${t.symbol}`} value={t.balance.toLocaleString()} neon="#9945ff" />
                ))}
              </div>
              <div className="mt-4 pt-3" style={{ borderTop: '1px solid rgba(0,212,255,0.1)' }}>
                <a href={`https://bscscan.com/address/${SOPHIA_ADDRESS}`} target="_blank" rel="noopener noreferrer"
                   className="text-xs font-body font-semibold flex items-center gap-1 transition-colors"
                   style={{ color: '#00d4ff' }}
                   onMouseEnter={e => (e.currentTarget.style.color = '#00ff88')}
                   onMouseLeave={e => (e.currentTarget.style.color = '#00d4ff')}>
                  🔍 View on BSCScan <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}

          {/* Trading history */}
          <div className="rounded-2xl p-5" style={{ background: '#12122a', border: '2px solid rgba(153,69,255,0.2)' }}>
            <h3 className="font-meme text-xl text-white mb-4 tracking-wide">
              ⚡ <span style={{ color: '#9945ff' }}>SOPHIA'S TRADES</span>
            </h3>
            {txs.length === 0 ? (
              <p className="text-sm font-body text-center py-6" style={{ color: '#6666aa' }}>
                🤖 No trades yet — Sophia is analyzing the market...
              </p>
            ) : txs.map(tx => (
              <div key={tx.id} className="flex items-center gap-3 py-2.5 text-xs font-body"
                   style={{ borderBottom: '1px solid rgba(153,69,255,0.08)' }}>
                <span className="font-meme text-sm w-20 shrink-0" style={{ color: TX_NEON[tx.tx_type] ?? '#c8c8e8' }}>
                  {TX_EMOJI[tx.tx_type] ?? '⚡'} {TX_LABEL[tx.tx_type] ?? tx.tx_type}
                </span>
                {tx.token_symbol && <span className="badge-purple">${tx.token_symbol}</span>}
                <span className="flex-1 truncate" style={{ color: '#8888aa' }}>{tx.description ?? '—'}</span>
                <span className="font-mono" style={{ color: '#c8c8e8' }}>{tx.amount.toLocaleString()}</span>
                {tx.tx_hash && (
                  <a href={`https://bscscan.com/tx/${tx.tx_hash}`} target="_blank" rel="noopener noreferrer"
                     style={{ color: '#9945ff' }}>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right panel */}
        <div className="space-y-4">
          {isConnected ? (
            <>
              {mine && mine.total_invested_bnb > 0 && (
                <div className="rounded-2xl p-5" style={{ background: '#12122a', border: '2px solid rgba(0,255,136,0.3)', boxShadow: '0 0 20px rgba(0,255,136,0.1)' }}>
                  <p className="text-xs font-body font-semibold uppercase tracking-widest mb-1" style={{ color: '#6666aa' }}>💼 My Investment</p>
                  <div className="font-meme text-3xl text-neon-green">{formatBNB(mine.total_invested_bnb)}</div>
                  <div className="text-xs font-body mt-1" style={{ color: '#6666aa' }}>{mine.num_transactions} transactions</div>
                </div>
              )}

              <div className="rounded-2xl p-5" style={{ background: '#12122a', border: '2px solid rgba(153,69,255,0.3)' }}>
                <h3 className="font-meme text-xl text-white mb-4 tracking-wide">🚀 INVEST NOW</h3>

                <div className="rounded-xl p-3 mb-4 text-xs font-body leading-relaxed"
                     style={{ background: 'rgba(255,230,0,0.07)', border: '1px solid rgba(255,230,0,0.25)', color: '#ffe600' }}>
                  <AlertTriangle className="w-3.5 h-3.5 inline mr-1.5" />
                  Send BNB to Sophia's wallet first:
                  <div className="font-mono mt-1.5 break-all text-xs p-2 rounded-lg"
                       style={{ background: 'rgba(0,0,0,0.3)', color: '#c8c8e8' }}>
                    {SOPHIA_ADDRESS}
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-body font-semibold block mb-1.5" style={{ color: '#6666aa' }}>
                      💰 Amount (BNB)
                    </label>
                    <input className="input" type="number" step="0.001" placeholder="0.1"
                           value={amount} onChange={e => setAmount(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs font-body font-semibold block mb-1.5" style={{ color: '#6666aa' }}>
                      🔗 TX Hash
                    </label>
                    <input className="input font-mono" placeholder="0x…"
                           value={txHash} onChange={e => setTxHash(e.target.value)} />
                  </div>
                  <motion.button
                    className="btn-meme w-full font-meme tracking-wide text-base"
                    disabled={!amount || !txHash || invest.isPending}
                    onClick={() => invest.mutate()}
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  >
                    {invest.isPending ? '⏳ Processing...' : '🚀 Confirm Investment'}
                  </motion.button>
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-2xl p-8 flex flex-col items-center gap-4 text-center"
                 style={{ background: '#12122a', border: '2px solid rgba(153,69,255,0.3)' }}>
              <span className="text-5xl">💰</span>
              <p className="font-meme text-xl text-white tracking-wide">JOIN THE FUND</p>
              <p className="text-sm font-body" style={{ color: '#6666aa' }}>
                Connect wallet to invest with Sophia
              </p>
              <ConnectButton />
            </div>
          )}

          {/* Risk disclaimer */}
          <div className="rounded-xl px-4 py-3 text-xs font-body"
               style={{ background: 'rgba(255,45,120,0.06)', border: '1px solid rgba(255,45,120,0.2)' }}>
            <span className="text-neon-pink font-bold">⚠️ RISK: </span>
            <span style={{ color: '#8888aa' }}>
              Meme tokens are extremely volatile. You may lose your entire investment. DYOR. Not financial advice.
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function PortfolioRow({ label, value, neon }: { label: string; value: string; neon: string }) {
  return (
    <div className="flex justify-between items-center py-1.5 text-sm"
         style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
      <span className="font-body" style={{ color: '#8888aa' }}>{label}</span>
      <span className="font-mono font-semibold" style={{ color: neon }}>{value}</span>
    </div>
  )
}
