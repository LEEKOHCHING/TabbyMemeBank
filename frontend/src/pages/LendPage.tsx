import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { useState } from 'react'
import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import toast from 'react-hot-toast'
import { lendingApi, LoanRequest, CreateLoanOffer } from '../services/api'
import { formatBNB } from '../services/web3'

function OfferModal({ loan, lender, onClose }: { loan: LoanRequest; lender: string; onClose: () => void }) {
  const qc = useQueryClient()
  const [txHash, setTxHash] = useState('')
  const [rate, setRate]     = useState(String(loan.interest_rate_pct))
  const repay = (loan.loan_amount_bnb * (1 + parseFloat(rate || '0') / 100 * loan.loan_duration_days / 365)).toFixed(6)

  const mut = useMutation({
    mutationFn: (d: CreateLoanOffer) => lendingApi.createOffer(d),
    onSuccess: (r) => { toast.success(r.message); qc.invalidateQueries({ queryKey: ['lending-requests'] }); onClose() },
    onError: (e: Error) => toast.error(e.message),
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
         style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
      <motion.div className="card max-w-sm w-full" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
        <h3 className="text-base font-bold text-white mb-4">确认放贷</h3>
        <div className="space-y-3 mb-4">
          <div className="rounded-lg p-3 space-y-1.5 text-xs"
               style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <Row label="抵押代币" value={loan.collateral_token_symbol} />
            <Row label="抵押数量" value={loan.collateral_amount.toLocaleString()} />
            <Row label="借款金额" value={formatBNB(loan.loan_amount_bnb)} cl="text-cyan-400" />
            <Row label="借款期限" value={`${loan.loan_duration_days} 天`} />
          </div>
          <div>
            <label className="text-2xs text-ink-muted block mb-1">调整利率 (%)</label>
            <input className="input" type="number" step="0.1" value={rate} onChange={e => setRate(e.target.value)} />
          </div>
          <div>
            <label className="text-2xs text-ink-muted block mb-1">放贷 TX Hash</label>
            <input className="input font-mono" placeholder="0x…" value={txHash} onChange={e => setTxHash(e.target.value)} />
          </div>
          <div className="flex justify-between text-xs rounded-lg p-3"
               style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)' }}>
            <span className="text-ink-muted">预计回收</span>
            <span className="text-green-400 font-semibold">{repay} BNB</span>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="btn-outline flex-1" onClick={onClose}>取消</button>
          <button className="btn-primary flex-1" disabled={!txHash || mut.isPending}
            onClick={() => mut.mutate({ loan_request_id: loan.id, lender_address: lender, offered_amount_bnb: loan.loan_amount_bnb, proposed_interest_rate_pct: parseFloat(rate), tx_hash: txHash })}>
            {mut.isPending ? '处理中…' : '确认放贷'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default function LendPage() {
  const { address, isConnected } = useAccount()
  const [selected, setSelected] = useState<LoanRequest | null>(null)

  const { data: requests = [], isLoading } = useQuery<LoanRequest[]>({
    queryKey: ['lending-requests'], queryFn: () => lendingApi.getRequests('open', 50), refetchInterval: 30_000,
  })
  const { data: myLoans } = useQuery({
    queryKey: ['my-loans', address], queryFn: () => lendingApi.getMyLoans(address!), enabled: !!address,
  })

  if (!isConnected) return (
    <div className="mx-auto max-w-sm px-4 py-20 text-center">
      <div className="sophia-avatar w-12 h-12 text-lg mx-auto mb-4"><ArrowUpRight className="w-5 h-5" /></div>
      <h2 className="text-lg font-bold text-white mb-2">连接钱包以放贷</h2>
      <p className="text-sm text-ink-muted mb-6">请先连接您的 BSC 钱包</p>
      <ConnectButton />
    </div>
  )

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      {selected && address && <OfferModal loan={selected} lender={address} onClose={() => setSelected(null)} />}

      <motion.div className="flex items-center gap-3 mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="sophia-avatar w-9 h-9 text-sm"><ArrowUpRight className="w-4 h-4" /></div>
        <div>
          <h1 className="text-lg font-bold text-white">放贷获益</h1>
          <p className="text-xs text-ink-muted">选择优质抵押订单，放出 BNB 赚取利息 (P2P)</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white">开放申请 ({requests.length})</h2>
          </div>
          {isLoading ? (
            <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="card animate-pulse h-20" />)}</div>
          ) : requests.length === 0 ? (
            <div className="card flex flex-col items-center py-12">
              <p className="text-sm text-ink-muted">暂无开放借贷申请</p>
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map((loan, i) => (
                <motion.div key={loan.id}
                  className="card-hover cursor-pointer group"
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                  onClick={() => setSelected(loan)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="badge-purple">${loan.collateral_token_symbol}</span>
                      <span className="text-xs text-ink-muted">抵押 {loan.collateral_amount.toLocaleString()} 枚</span>
                    </div>
                    <button className="btn-primary text-xs px-3 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      放贷
                    </button>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-center text-xs">
                    <Stat label="借款金额" value={formatBNB(loan.loan_amount_bnb)} cl="text-cyan-400" />
                    <Stat label="年化利率" value={`${loan.interest_rate_pct}%`} cl="text-amber-400" />
                    <Stat label="期限"     value={`${loan.loan_duration_days}天`} />
                    <Stat label="借款人"   value={`${loan.borrower_address.slice(0,6)}…`} />
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-sm font-semibold text-white mb-4">我的放贷</h2>
          {myLoans?.lending?.length ? (
            <div className="space-y-3">
              {myLoans.lending.map(c => (
                <div key={c.id} className="card text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="badge-purple">{c.collateral_token}</span>
                    <span className={c.status === 'active' ? 'badge-green' : 'badge-amber'}>{c.status}</span>
                  </div>
                  <Row label="放出"   value={formatBNB(c.loan_amount_bnb)} />
                  <Row label="回收"   value={formatBNB(c.total_repayment_bnb)} cl="text-green-400" />
                  <Row label="到期日" value={new Date(c.due_date).toLocaleDateString('zh-CN')} />
                </div>
              ))}
            </div>
          ) : (
            <div className="card flex flex-col items-center py-12 gap-2">
              <p className="text-sm text-ink-muted">暂无放贷记录</p>
              <p className="text-xs text-ink-muted">点击左边申请单开始放贷</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Row({ label, value, cl = 'text-ink-secondary' }: { label: string; value: string; cl?: string }) {
  return <div className="flex justify-between"><span className="text-ink-muted">{label}</span><span className={`font-mono ${cl}`}>{value}</span></div>
}
function Stat({ label, value, cl = 'text-ink-secondary' }: { label: string; value: string; cl?: string }) {
  return <div><div className="text-ink-muted mb-0.5">{label}</div><div className={`font-semibold ${cl}`}>{value}</div></div>
}
