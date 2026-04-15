import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { ArrowUpRight, Filter } from 'lucide-react'
import { useState } from 'react'
import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import toast from 'react-hot-toast'
import { lendingApi, LoanRequest, CreateLoanOffer } from '../services/api'
import { formatBNB } from '../services/web3'

function LoanOfferModal({
  loan,
  lenderAddress,
  onClose,
}: {
  loan: LoanRequest
  lenderAddress: string
  onClose: () => void
}) {
  const qc = useQueryClient()
  const [txHash, setTxHash] = useState('')
  const [rate, setRate] = useState(String(loan.interest_rate_pct))

  const totalRepay = parseFloat(formatBNB(loan.loan_amount_bnb * (1 + parseFloat(rate) / 100 * loan.loan_duration_days / 365), 6))

  const mutation = useMutation({
    mutationFn: (data: CreateLoanOffer) => lendingApi.createOffer(data),
    onSuccess: (res) => {
      toast.success(res.message)
      qc.invalidateQueries({ queryKey: ['lending-requests'] })
      onClose()
    },
    onError: (err: Error) => toast.error(err.message),
  })

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        className="card max-w-md w-full"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <h3 className="font-display font-bold text-white mb-4">确认放贷</h3>

        <div className="space-y-3 mb-4">
          <div className="card-elevated">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div><span className="text-slate-500">抵押代币：</span><span className="text-white">{loan.collateral_token_symbol}</span></div>
              <div><span className="text-slate-500">抵押数量：</span><span className="text-white">{loan.collateral_amount.toLocaleString()}</span></div>
              <div><span className="text-slate-500">借款金额：</span><span className="text-sophia-cyan">{formatBNB(loan.loan_amount_bnb)}</span></div>
              <div><span className="text-slate-500">期限：</span><span className="text-white">{loan.loan_duration_days} 天</span></div>
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-500 mb-1 block">调整利率 (%)</label>
            <input
              type="number" step="0.1"
              className="w-full bg-bank-bg border border-bank-border rounded-lg px-3 py-2 text-sm text-white focus:border-tabby-500 outline-none"
              value={rate}
              onChange={e => setRate(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs text-slate-500 mb-1 block">放贷交易 TX Hash</label>
            <input
              className="w-full bg-bank-bg border border-bank-border rounded-lg px-3 py-2 text-sm text-white focus:border-tabby-500 outline-none font-mono"
              placeholder="0x..."
              value={txHash}
              onChange={e => setTxHash(e.target.value)}
            />
          </div>

          <div className="card-elevated text-xs">
            <div className="flex justify-between text-slate-400 mb-1">
              <span>放贷金额</span>
              <span className="text-sophia-cyan">{formatBNB(loan.loan_amount_bnb)}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span className="text-slate-300">预计回收</span>
              <span className="text-sophia-green">{totalRepay} BNB</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button className="btn-ghost flex-1" onClick={onClose}>取消</button>
          <button
            className="btn-primary flex-1"
            disabled={!txHash || mutation.isPending}
            onClick={() => mutation.mutate({
              loan_request_id: loan.id,
              lender_address: lenderAddress,
              offered_amount_bnb: loan.loan_amount_bnb,
              proposed_interest_rate_pct: parseFloat(rate),
              tx_hash: txHash,
            })}
          >
            {mutation.isPending ? '处理中...' : '确认放贷'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default function LendPage() {
  const { address, isConnected } = useAccount()
  const [selectedLoan, setSelectedLoan] = useState<LoanRequest | null>(null)

  const { data: requests = [], isLoading } = useQuery<LoanRequest[]>({
    queryKey: ['lending-requests'],
    queryFn: () => lendingApi.getRequests('open', 50),
    refetchInterval: 30_000,
  })

  const { data: myLoans } = useQuery({
    queryKey: ['my-loans', address],
    queryFn: () => lendingApi.getMyLoans(address!),
    enabled: !!address,
  })

  if (!isConnected) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <ArrowUpRight className="w-12 h-12 text-sophia-green mx-auto mb-4" />
        <h2 className="font-display font-bold text-white text-xl mb-2">连接钱包以放贷</h2>
        <p className="text-slate-500 text-sm mb-6">请先连接您的 BSC 钱包</p>
        <ConnectButton />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {selectedLoan && address && (
        <LoanOfferModal
          loan={selectedLoan}
          lenderAddress={address}
          onClose={() => setSelectedLoan(null)}
        />
      )}

      <motion.div className="flex items-center gap-3 mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sophia-green to-emerald-700 flex items-center justify-center">
          <ArrowUpRight className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-display font-bold text-white text-xl">放贷获益</h1>
          <p className="text-xs text-slate-500">选择优质抵押订单，放出 BNB 赚取利息 (P2P)</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Open Requests */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-300">开放借贷申请 ({requests.length})</h2>
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Filter className="w-3 h-3" /> 按时间排序
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => <div key={i} className="card animate-pulse h-24" />)}
            </div>
          ) : requests.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-slate-500 text-sm">目前没有开放的借贷申请</p>
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map((loan, i) => (
                <motion.div
                  key={loan.id}
                  className="card hover:border-sophia-green/30 transition-all cursor-pointer group"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => setSelectedLoan(loan)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="badge badge-purple">${loan.collateral_token_symbol}</span>
                      <span className="text-xs text-slate-500">
                        抵押 {loan.collateral_amount.toLocaleString()} 枚
                      </span>
                    </div>
                    <button className="btn-primary text-xs px-3 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      放贷
                    </button>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-center text-xs">
                    <div>
                      <div className="text-slate-500 mb-0.5">需借金额</div>
                      <div className="text-sophia-cyan font-semibold">{formatBNB(loan.loan_amount_bnb)}</div>
                    </div>
                    <div>
                      <div className="text-slate-500 mb-0.5">年化利率</div>
                      <div className="text-sophia-gold font-semibold">{loan.interest_rate_pct}%</div>
                    </div>
                    <div>
                      <div className="text-slate-500 mb-0.5">期限</div>
                      <div className="text-white font-semibold">{loan.loan_duration_days}天</div>
                    </div>
                    <div>
                      <div className="text-slate-500 mb-0.5">借款人</div>
                      <div className="text-white font-mono">{loan.borrower_address.slice(0, 6)}...</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* My Lending */}
        <div>
          <h2 className="text-sm font-semibold text-slate-300 mb-4">我的放贷</h2>
          {myLoans?.lending && myLoans.lending.length > 0 ? (
            <div className="space-y-3">
              {myLoans.lending.map(c => (
                <div key={c.id} className="card text-xs">
                  <div className="flex justify-between mb-2">
                    <span className="badge badge-purple">{c.collateral_token}</span>
                    <span className={`badge ${c.status === 'active' ? 'badge-green' : 'badge-gold'}`}>{c.status}</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">放出</span>
                      <span className="text-white">{formatBNB(c.loan_amount_bnb)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">回收</span>
                      <span className="text-sophia-green">{formatBNB(c.total_repayment_bnb)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">到期日</span>
                      <span className="text-white">{new Date(c.due_date).toLocaleDateString('zh-CN')}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card text-center py-10">
              <p className="text-slate-500 text-sm">暂无放贷记录</p>
              <p className="text-xs text-slate-600 mt-1">点击左边的申请单开始放贷</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
