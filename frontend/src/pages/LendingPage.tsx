import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { ArrowDownLeft, AlertTriangle, Clock, Percent } from 'lucide-react'
import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import toast from 'react-hot-toast'
import { lendingApi, CreateLoanRequest } from '../services/api'
import { formatBNB } from '../services/web3'

const DURATIONS = [7, 14, 30, 60, 90]

export default function LendingPage() {
  const { address, isConnected } = useAccount()
  const qc = useQueryClient()
  const [form, setForm] = useState({
    collateral_token_symbol: '', collateral_token_address: '',
    collateral_amount: '', loan_amount_bnb: '', loan_duration_days: 30,
    interest_rate_pct: '', collateral_tx_hash: '', notes: '',
  })

  const { data: myLoans } = useQuery({
    queryKey: ['my-loans', address], queryFn: () => lendingApi.getMyLoans(address!), enabled: !!address,
  })

  const submit = useMutation({
    mutationFn: (d: CreateLoanRequest) => lendingApi.createRequest(d),
    onSuccess: (r) => { toast.success(r.message); qc.invalidateQueries({ queryKey: ['lending-requests'] }) },
    onError: (e: Error) => toast.error(e.message),
  })

  const upd = (k: string, v: string | number) => setForm(f => ({ ...f, [k]: v }))

  if (!isConnected) return (
    <div className="mx-auto max-w-sm px-4 py-20 text-center">
      <div className="sophia-avatar w-12 h-12 text-lg mx-auto mb-4"><ArrowDownLeft className="w-5 h-5" /></div>
      <h2 className="text-lg font-bold text-white mb-2">连接钱包以借贷</h2>
      <p className="text-sm text-ink-muted mb-6">请先连接您的 BSC 钱包</p>
      <ConnectButton />
    </div>
  )

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <motion.div className="flex items-center gap-3 mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="sophia-avatar w-9 h-9 text-sm"><ArrowDownLeft className="w-4 h-4" /></div>
        <div>
          <h1 className="text-lg font-bold text-white">Meme 代币抵押借贷</h1>
          <p className="text-xs text-ink-muted">抵押 Meme 代币，借出 BNB 资金 (P2P)</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="card space-y-4">
          <h2 className="text-sm font-semibold text-white">提交借贷申请</h2>
          <div className="rounded-lg p-3 text-xs text-amber-300 leading-relaxed"
               style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.2)' }}>
            <AlertTriangle className="w-3.5 h-3.5 inline mr-1" />
            请先将抵押代币转入 Sophia 行长钱包，再填写下方信息
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-2xs text-ink-muted block mb-1">代币符号</label>
              <input className="input" placeholder="PEPE" value={form.collateral_token_symbol}
                     onChange={e => upd('collateral_token_symbol', e.target.value.toUpperCase())} />
            </div>
            <div>
              <label className="text-2xs text-ink-muted block mb-1">抵押数量</label>
              <input className="input" type="number" placeholder="1000000" value={form.collateral_amount}
                     onChange={e => upd('collateral_amount', e.target.value)} />
            </div>
          </div>

          <div>
            <label className="text-2xs text-ink-muted block mb-1">代币合约地址</label>
            <input className="input font-mono" placeholder="0x…" value={form.collateral_token_address}
                   onChange={e => upd('collateral_token_address', e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-2xs text-ink-muted block mb-1">借款金额 (BNB)</label>
              <input className="input" type="number" step="0.001" placeholder="0.1" value={form.loan_amount_bnb}
                     onChange={e => upd('loan_amount_bnb', e.target.value)} />
            </div>
            <div>
              <label className="text-2xs text-ink-muted block mb-1 flex items-center gap-1">
                <Percent className="w-3 h-3" />年化利率 (%)
              </label>
              <input className="input" type="number" step="0.1" placeholder="12" value={form.interest_rate_pct}
                     onChange={e => upd('interest_rate_pct', e.target.value)} />
            </div>
          </div>

          <div>
            <label className="text-2xs text-ink-muted block mb-2 flex items-center gap-1">
              <Clock className="w-3 h-3" /> 借贷期限
            </label>
            <div className="flex gap-2 flex-wrap">
              {DURATIONS.map(d => (
                <button key={d} type="button" onClick={() => upd('loan_duration_days', d)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                    form.loan_duration_days === d
                      ? 'text-white' : 'text-ink-muted hover:text-ink-secondary'
                  }`}
                  style={form.loan_duration_days === d
                    ? { background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', boxShadow: '0 0 12px rgba(124,58,237,0.3)' }
                    : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }
                  }>
                  {d} 天
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-2xs text-ink-muted block mb-1">抵押转账 TX Hash</label>
            <input className="input font-mono" placeholder="0x…" value={form.collateral_tx_hash}
                   onChange={e => upd('collateral_tx_hash', e.target.value)} />
          </div>

          <button className="btn-primary w-full" disabled={submit.isPending}
            onClick={() => submit.mutate({
              borrower_address: address!,
              collateral_token_symbol: form.collateral_token_symbol,
              collateral_token_address: form.collateral_token_address,
              collateral_amount: parseFloat(form.collateral_amount),
              loan_amount_bnb: parseFloat(form.loan_amount_bnb),
              loan_duration_days: form.loan_duration_days,
              interest_rate_pct: parseFloat(form.interest_rate_pct),
              collateral_tx_hash: form.collateral_tx_hash,
              notes: form.notes,
            })}>
            {submit.isPending ? '提交中…' : '提交借贷申请'}
          </button>
        </div>

        {/* My loans */}
        <div>
          <h2 className="text-sm font-semibold text-white mb-4">我的借贷</h2>
          {myLoans?.borrowing?.length ? (
            <div className="space-y-3">
              {myLoans.borrowing.map(c => (
                <div key={c.id} className="card text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="badge-cyan">{c.collateral_token}</span>
                    <span className={c.status === 'active' ? 'badge-green' : 'badge-amber'}>{c.status}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    <Row label="借款" value={formatBNB(c.loan_amount_bnb)} />
                    <Row label="还款" value={formatBNB(c.total_repayment_bnb)} cl="text-red-400" />
                    <Row label="到期" value={new Date(c.due_date).toLocaleDateString('zh-CN')} />
                    <Row label="利率" value={`${c.interest_rate_pct}%`} cl="text-amber-400" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card flex flex-col items-center py-12 gap-2">
              <p className="text-sm text-ink-muted">暂无借贷记录</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Row({ label, value, cl = 'text-ink-secondary' }: { label: string; value: string; cl?: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-ink-muted">{label}</span>
      <span className={`font-mono ${cl}`}>{value}</span>
    </div>
  )
}
