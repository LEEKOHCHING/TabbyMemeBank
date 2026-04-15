import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { ArrowDownLeft, Shield, Clock, Percent, AlertTriangle } from 'lucide-react'
import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import toast from 'react-hot-toast'
import { lendingApi, LoanRequest, CreateLoanRequest } from '../services/api'
import { formatBNB } from '../services/web3'

const DURATION_OPTIONS = [7, 14, 30, 60, 90]

function LoanCard({ loan }: { loan: LoanRequest }) {
  return (
    <div className="card hover:border-bank-muted transition-colors">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="badge badge-purple">${loan.collateral_token_symbol}</span>
          <span className="badge badge-cyan">{loan.status === 'open' ? '等待放贷' : loan.status}</span>
        </div>
        <span className="text-xs text-slate-500">
          {new Date(loan.created_at).toLocaleDateString('zh-CN')}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-3 text-center">
        <div>
          <div className="text-xs text-slate-500 mb-1">抵押数量</div>
          <div className="text-sm font-semibold text-white">
            {loan.collateral_amount.toLocaleString()} {loan.collateral_token_symbol}
          </div>
        </div>
        <div>
          <div className="text-xs text-slate-500 mb-1">借款金额</div>
          <div className="text-sm font-semibold text-sophia-cyan">{formatBNB(loan.loan_amount_bnb)}</div>
        </div>
        <div>
          <div className="text-xs text-slate-500 mb-1">年化利率</div>
          <div className="text-sm font-semibold text-sophia-gold">{loan.interest_rate_pct}%</div>
        </div>
      </div>
      <div className="mt-2 pt-2 border-t border-bank-border/50 flex items-center justify-between">
        <span className="text-xs text-slate-500 flex items-center gap-1">
          <Clock className="w-3 h-3" /> 期限 {loan.loan_duration_days} 天
        </span>
        <span className="text-xs text-slate-600">
          {loan.borrower_address.slice(0, 6)}...{loan.borrower_address.slice(-4)}
        </span>
      </div>
    </div>
  )
}

export default function LendingPage() {
  const { address, isConnected } = useAccount()
  const qc = useQueryClient()
  const [form, setForm] = useState({
    collateral_token_symbol: '',
    collateral_token_address: '',
    collateral_amount: '',
    loan_amount_bnb: '',
    loan_duration_days: 30,
    interest_rate_pct: '',
    collateral_tx_hash: '',
    notes: '',
  })

  const { data: myLoans } = useQuery({
    queryKey: ['my-loans', address],
    queryFn: () => lendingApi.getMyLoans(address!),
    enabled: !!address,
  })

  const mutation = useMutation({
    mutationFn: (data: CreateLoanRequest) => lendingApi.createRequest(data),
    onSuccess: (res) => {
      toast.success(res.message)
      qc.invalidateQueries({ queryKey: ['lending-requests'] })
      setForm({ collateral_token_symbol: '', collateral_token_address: '', collateral_amount: '', loan_amount_bnb: '', loan_duration_days: 30, interest_rate_pct: '', collateral_tx_hash: '', notes: '' })
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!address) return
    mutation.mutate({
      borrower_address: address,
      collateral_token_symbol: form.collateral_token_symbol,
      collateral_token_address: form.collateral_token_address,
      collateral_amount: parseFloat(form.collateral_amount),
      loan_amount_bnb: parseFloat(form.loan_amount_bnb),
      loan_duration_days: form.loan_duration_days,
      interest_rate_pct: parseFloat(form.interest_rate_pct),
      collateral_tx_hash: form.collateral_tx_hash,
      notes: form.notes,
    })
  }

  if (!isConnected) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <ArrowDownLeft className="w-12 h-12 text-sophia-cyan mx-auto mb-4" />
        <h2 className="font-display font-bold text-white text-xl mb-2">连接钱包以借贷</h2>
        <p className="text-slate-500 text-sm mb-6">请先连接您的 BSC 钱包</p>
        <ConnectButton />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <motion.div className="flex items-center gap-3 mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sophia-cyan to-blue-600 flex items-center justify-center">
          <ArrowDownLeft className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-display font-bold text-white text-xl">Meme 代币抵押借贷</h1>
          <p className="text-xs text-slate-500">抵押您的 Meme 代币，借出 BNB 资金 (P2P)</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Borrow Form */}
        <div>
          <h2 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4 text-sophia-cyan" /> 提交借贷申请
          </h2>
          <form onSubmit={handleSubmit} className="card space-y-4">
            <div className="bg-sophia-gold/10 border border-sophia-gold/30 rounded-lg p-3">
              <p className="text-xs text-sophia-gold flex items-start gap-2">
                <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                请先将抵押代币转账至 Sophia 行长地址，然后填写以下信息。Sophia 将评估风险并决定是否通过。
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-500 mb-1 block">代币符号</label>
                <input
                  className="w-full bg-bank-bg border border-bank-border rounded-lg px-3 py-2 text-sm text-white focus:border-tabby-500 outline-none"
                  placeholder="PEPE"
                  value={form.collateral_token_symbol}
                  onChange={e => setForm(f => ({ ...f, collateral_token_symbol: e.target.value.toUpperCase() }))}
                  required
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">抵押数量</label>
                <input
                  type="number"
                  className="w-full bg-bank-bg border border-bank-border rounded-lg px-3 py-2 text-sm text-white focus:border-tabby-500 outline-none"
                  placeholder="1000000"
                  value={form.collateral_amount}
                  onChange={e => setForm(f => ({ ...f, collateral_amount: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-500 mb-1 block">代币合约地址 (BSC)</label>
              <input
                className="w-full bg-bank-bg border border-bank-border rounded-lg px-3 py-2 text-sm text-white focus:border-tabby-500 outline-none font-mono"
                placeholder="0x..."
                value={form.collateral_token_address}
                onChange={e => setForm(f => ({ ...f, collateral_token_address: e.target.value }))}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-500 mb-1 block">借款金额 (BNB)</label>
                <input
                  type="number"
                  step="0.001"
                  className="w-full bg-bank-bg border border-bank-border rounded-lg px-3 py-2 text-sm text-white focus:border-tabby-500 outline-none"
                  placeholder="0.1"
                  value={form.loan_amount_bnb}
                  onChange={e => setForm(f => ({ ...f, loan_amount_bnb: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                  <Percent className="w-3 h-3" /> 年化利率 (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  className="w-full bg-bank-bg border border-bank-border rounded-lg px-3 py-2 text-sm text-white focus:border-tabby-500 outline-none"
                  placeholder="12"
                  value={form.interest_rate_pct}
                  onChange={e => setForm(f => ({ ...f, interest_rate_pct: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-500 mb-2 block flex items-center gap-1">
                <Clock className="w-3 h-3" /> 借贷期限
              </label>
              <div className="flex gap-2 flex-wrap">
                {DURATION_OPTIONS.map(d => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, loan_duration_days: d }))}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      form.loan_duration_days === d
                        ? 'bg-tabby-500 text-white'
                        : 'bg-bank-bg border border-bank-border text-slate-400 hover:border-tabby-500'
                    }`}
                  >
                    {d} 天
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-500 mb-1 block">抵押转账 TX Hash</label>
              <input
                className="w-full bg-bank-bg border border-bank-border rounded-lg px-3 py-2 text-sm text-white focus:border-tabby-500 outline-none font-mono"
                placeholder="0x..."
                value={form.collateral_tx_hash}
                onChange={e => setForm(f => ({ ...f, collateral_tx_hash: e.target.value }))}
                required
              />
            </div>

            <button
              type="submit"
              disabled={mutation.isPending}
              className="btn-primary w-full"
            >
              {mutation.isPending ? '提交中...' : '提交借贷申请'}
            </button>
          </form>
        </div>

        {/* My Loans */}
        <div>
          <h2 className="text-sm font-semibold text-slate-300 mb-4">我的借贷</h2>
          {myLoans?.borrowing && myLoans.borrowing.length > 0 ? (
            <div className="space-y-3">
              {myLoans.borrowing.map(c => (
                <div key={c.id} className="card">
                  <div className="flex justify-between mb-2">
                    <span className="badge badge-cyan">{c.collateral_token}</span>
                    <span className={`badge ${c.status === 'active' ? 'badge-green' : 'badge-gold'}`}>{c.status}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div><span className="text-slate-500">借款：</span><span className="text-white">{formatBNB(c.loan_amount_bnb)}</span></div>
                    <div><span className="text-slate-500">还款：</span><span className="text-sophia-red">{formatBNB(c.total_repayment_bnb)}</span></div>
                    <div><span className="text-slate-500">到期：</span><span className="text-white">{new Date(c.due_date).toLocaleDateString('zh-CN')}</span></div>
                    <div><span className="text-slate-500">利率：</span><span className="text-sophia-gold">{c.interest_rate_pct}%</span></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card text-center py-10">
              <p className="text-slate-500 text-sm">暂无借贷记录</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
