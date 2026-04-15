import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { TrendingUp, Wallet, BarChart3, ExternalLink } from 'lucide-react'
import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import toast from 'react-hot-toast'
import { fundApi, FundStats, Portfolio, FundTx } from '../services/api'
import { formatUSD, formatBNB, SOPHIA_ADDRESS } from '../services/web3'

function TxRow({ tx }: { tx: FundTx }) {
  const typeColor = {
    buy: 'text-sophia-green',
    sell: 'text-sophia-red',
    add_liquidity: 'text-sophia-cyan',
    remove_liquidity: 'text-sophia-gold',
  }[tx.tx_type] || 'text-slate-400'

  const typeLabel = {
    buy: '买入',
    sell: '卖出',
    add_liquidity: '添加流动性',
    remove_liquidity: '移除流动性',
  }[tx.tx_type] || tx.tx_type

  return (
    <div className="flex items-center gap-3 py-2 border-b border-bank-border/50 last:border-0 text-xs">
      <span className={`font-medium w-20 ${typeColor}`}>{typeLabel}</span>
      <span className="badge badge-purple">${tx.token_symbol}</span>
      <span className="flex-1 text-slate-400 truncate">{tx.description || '—'}</span>
      <span className="text-white font-mono">{tx.amount.toLocaleString()}</span>
      {tx.tx_hash && (
        <a
          href={`https://bscscan.com/tx/${tx.tx_hash}`}
          target="_blank" rel="noopener noreferrer"
          className="text-tabby-400 hover:text-tabby-300"
        >
          <ExternalLink className="w-3 h-3" />
        </a>
      )}
    </div>
  )
}

export default function MemeFundPage() {
  const { address, isConnected } = useAccount()
  const qc = useQueryClient()
  const [amount, setAmount] = useState('')
  const [txHash, setTxHash] = useState('')

  const { data: stats } = useQuery<FundStats>({
    queryKey: ['fund-stats'],
    queryFn: fundApi.getStats,
    refetchInterval: 30_000,
  })

  const { data: portfolio } = useQuery<Portfolio>({
    queryKey: ['fund-portfolio'],
    queryFn: fundApi.getPortfolio,
    refetchInterval: 60_000,
  })

  const { data: txs = [] } = useQuery<FundTx[]>({
    queryKey: ['fund-transactions'],
    queryFn: () => fundApi.getTransactions(20),
    refetchInterval: 30_000,
  })

  const { data: myInvestment } = useQuery({
    queryKey: ['my-investment', address],
    queryFn: () => fundApi.getMyInvestment(address!),
    enabled: !!address,
  })

  const mutation = useMutation({
    mutationFn: () => fundApi.invest({ wallet_address: address!, amount_bnb: parseFloat(amount), tx_hash: txHash }),
    onSuccess: (res) => {
      toast.success(res.message)
      qc.invalidateQueries({ queryKey: ['fund-stats'] })
      qc.invalidateQueries({ queryKey: ['my-investment'] })
      setAmount(''); setTxHash('')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const pnl = stats?.total_profit_loss_usd ?? 0

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <motion.div className="flex items-center gap-3 mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-tabby-500 to-tabby-700 flex items-center justify-center glow-orange">
          <TrendingUp className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-display font-bold text-white text-xl">TABBY MEME 基金</h1>
          <p className="text-xs text-slate-500">由 Sophia 行长管理的 BSC Meme 代币主动管理基金</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Stats + Portfolio */}
        <div className="lg:col-span-2 space-y-5">
          {/* Fund Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: '总管理规模', value: `${(stats?.total_invested_bnb ?? 0).toFixed(3)} BNB`, icon: Wallet },
              { label: '组合市值', value: formatUSD(stats?.total_portfolio_value_usd ?? 0), icon: BarChart3 },
              { label: '累计盈亏', value: formatUSD(Math.abs(pnl)), icon: TrendingUp, green: pnl >= 0 },
              { label: '投资人数', value: String(stats?.num_investors ?? 0), icon: Wallet },
            ].map(({ label, value, icon: Icon, green }, i) => (
              <motion.div key={label} className="stat-card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="stat-label">{label}</span>
                  <Icon className="w-3.5 h-3.5 text-tabby-500" />
                </div>
                <div className={`stat-value text-lg ${green !== undefined ? (green ? 'text-sophia-green' : 'text-sophia-red') : 'text-white'}`}>
                  {value}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Portfolio Holdings */}
          {portfolio && (
            <div className="card">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-tabby-500" />
                Sophia 当前持仓
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">BNB (现金)</span>
                  <span className="text-white font-mono">{formatBNB(portfolio.bnb_balance)}</span>
                </div>
                {portfolio.tokens.map(t => (
                  <div key={t.symbol} className="flex justify-between text-xs">
                    <span className="text-slate-500">${t.symbol}</span>
                    <span className="text-white font-mono">{t.balance.toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="mt-2 pt-2 border-t border-bank-border/50">
                <a
                  href={`https://bscscan.com/address/${SOPHIA_ADDRESS}`}
                  target="_blank" rel="noopener noreferrer"
                  className="text-xs text-tabby-400 hover:text-tabby-300 flex items-center gap-1"
                >
                  在 BSCScan 查看钱包 <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}

          {/* Transaction History */}
          <div className="card">
            <h3 className="text-sm font-semibold text-white mb-3">Sophia 操盘记录</h3>
            {txs.length === 0 ? (
              <p className="text-slate-500 text-xs text-center py-6">暂无交易记录</p>
            ) : (
              <div>
                {txs.map(tx => <TxRow key={tx.id} tx={tx} />)}
              </div>
            )}
          </div>
        </div>

        {/* Right: Invest Panel */}
        <div className="space-y-4">
          {isConnected ? (
            <>
              {/* My Investment */}
              {myInvestment && myInvestment.total_invested_bnb > 0 && (
                <div className="card border-tabby-500/30">
                  <h3 className="text-xs text-slate-500 mb-2">我的投资</h3>
                  <div className="text-2xl font-bold text-white mb-1">
                    {formatBNB(myInvestment.total_invested_bnb)}
                  </div>
                  <div className="text-xs text-slate-500">{myInvestment.num_transactions} 笔投资</div>
                </div>
              )}

              {/* Invest Form */}
              <div className="card">
                <h3 className="text-sm font-semibold text-white mb-4">投资基金</h3>
                <div className="bg-sophia-gold/10 border border-sophia-gold/20 rounded-lg p-3 mb-4">
                  <p className="text-xs text-sophia-gold leading-relaxed">
                    请将 BNB 转入 Sophia 行长钱包：
                    <br />
                    <span className="font-mono text-xs break-all">{SOPHIA_ADDRESS}</span>
                    <br />
                    然后填写以下信息确认投资。
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">投资金额 (BNB)</label>
                    <input
                      type="number" step="0.001"
                      className="w-full bg-bank-bg border border-bank-border rounded-lg px-3 py-2 text-sm text-white focus:border-tabby-500 outline-none"
                      placeholder="0.1"
                      value={amount}
                      onChange={e => setAmount(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">转账 TX Hash</label>
                    <input
                      className="w-full bg-bank-bg border border-bank-border rounded-lg px-3 py-2 text-sm text-white focus:border-tabby-500 outline-none font-mono"
                      placeholder="0x..."
                      value={txHash}
                      onChange={e => setTxHash(e.target.value)}
                    />
                  </div>
                  <button
                    className="btn-primary w-full"
                    disabled={!amount || !txHash || mutation.isPending}
                    onClick={() => mutation.mutate()}
                  >
                    {mutation.isPending ? '确认中...' : '确认投资'}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="card text-center py-8">
              <TrendingUp className="w-10 h-10 text-tabby-500 mx-auto mb-3" />
              <p className="text-sm text-white mb-2">连接钱包以投资</p>
              <p className="text-xs text-slate-500 mb-4">加入 TABBY MEME 基金，让 Sophia 为您操盘</p>
              <ConnectButton />
            </div>
          )}

          {/* Disclaimer */}
          <div className="card border-sophia-red/20 bg-sophia-red/5">
            <p className="text-xs text-slate-500 leading-relaxed">
              <span className="text-sophia-red">风险提示：</span>
              Meme 代币价格波动极大，投资可能损失全部本金。请理性投资。
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
