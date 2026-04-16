import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { ArrowUpRight, ExternalLink } from 'lucide-react'
import { useState } from 'react'
import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import toast from 'react-hot-toast'
import { lendingApi, LoanRequest, CreateLoanOffer } from '../services/api'
import { formatBNB } from '../services/web3'

const STATUS_BADGE: Record<string, string> = { active: 'badge-green', pending: 'badge-yellow', closed: 'badge-purple', defaulted: 'badge-pink' }

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
         style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)' }}>
      <motion.div className="rounded-2xl p-6 max-w-sm w-full"
                  style={{ background: '#12122a', border: '2px solid rgba(0,255,136,0.35)', boxShadow: '0 0 40px rgba(0,255,136,0.15)' }}
                  initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
        <h3 className="font-meme text-2xl text-white mb-5 tracking-wide">🤑 CONFIRM LEND</h3>

        <div className="rounded-xl p-4 space-y-2 mb-4 text-sm font-body"
             style={{ background: 'rgba(0,255,136,0.04)', border: '1px solid rgba(0,255,136,0.15)' }}>
          <InfoRow label="🪙 Collateral" value={loan.collateral_token_symbol} />
          <InfoRow label="📦 Amount"     value={loan.collateral_amount.toLocaleString()} />
          <InfoRow label="💰 Loan"       value={formatBNB(loan.loan_amount_bnb)} neon="#00d4ff" />
          <InfoRow label="⏱️ Duration"   value={`${loan.loan_duration_days} days`} />
        </div>

        <div className="space-y-3 mb-4">
          <div>
            <label className="text-xs font-body font-semibold block mb-1.5" style={{ color: '#6666aa' }}>📈 APR (%)</label>
            <input className="input" type="number" step="0.1" value={rate} onChange={e => setRate(e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-body font-semibold block mb-1.5" style={{ color: '#6666aa' }}>🔗 TX Hash</label>
            <input className="input font-mono" placeholder="0x…" value={txHash} onChange={e => setTxHash(e.target.value)} />
          </div>
          <div className="rounded-xl px-4 py-3 flex justify-between items-center"
               style={{ background: 'rgba(0,255,136,0.06)', border: '1px solid rgba(0,255,136,0.2)' }}>
            <span className="text-sm font-body" style={{ color: '#6666aa' }}>💵 Expected Return</span>
            <span className="font-meme text-xl text-neon-green">{repay} BNB</span>
          </div>
        </div>

        <div className="flex gap-3">
          <button className="btn-outline flex-1 font-body" onClick={onClose}>Cancel</button>
          <motion.button
            className="btn-meme flex-1 font-meme tracking-wide"
            disabled={!txHash || mut.isPending}
            onClick={() => mut.mutate({
              loan_request_id: loan.id, lender_address: lender,
              offered_amount_bnb: loan.loan_amount_bnb,
              proposed_interest_rate_pct: parseFloat(rate), tx_hash: txHash,
            })}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          >
            {mut.isPending ? '⏳ Processing...' : '🤑 Confirm Lend'}
          </motion.button>
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
      <div className="sophia-avatar w-16 h-16 text-3xl mx-auto mb-4 animate-float">🤑</div>
      <h2 className="font-meme text-3xl text-white mb-2 tracking-wide">LEND & EARN</h2>
      <p className="text-sm font-body mb-6" style={{ color: '#6666aa' }}>Connect your BSC wallet to start earning</p>
      <ConnectButton />
    </div>
  )

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      {selected && address && <OfferModal loan={selected} lender={address} onClose={() => setSelected(null)} />}

      <motion.div className="flex items-center gap-4 mb-8" initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="sophia-avatar w-12 h-12 text-2xl animate-float">🤑</div>
        <div>
          <h1 className="font-meme text-4xl text-white tracking-wide" style={{ letterSpacing: '0.05em' }}>
            LEND & <span className="text-neon-green">EARN</span>
          </h1>
          <p className="text-sm font-body mt-1" style={{ color: '#6666aa' }}>
            💰 Pick collateral orders, lend BNB, earn interest (P2P)
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Open requests */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-meme text-xl text-white tracking-wide">
              📋 OPEN REQUESTS
              <span className="ml-2 text-sm font-body font-semibold" style={{ color: '#9945ff' }}>
                ({requests.length})
              </span>
            </h2>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => (
                <div key={i} className="rounded-2xl animate-pulse h-24"
                     style={{ background: '#12122a', border: '2px solid #1e1e40' }} />
              ))}
            </div>
          ) : requests.length === 0 ? (
            <div className="rounded-2xl p-14 flex flex-col items-center gap-3 text-center"
                 style={{ background: '#12122a', border: '2px solid rgba(0,255,136,0.15)' }}>
              <span className="text-5xl">🏜️</span>
              <p className="font-meme text-xl text-white">NO OPEN REQUESTS</p>
              <p className="text-sm font-body" style={{ color: '#6666aa' }}>Come back later or borrow first!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map((loan, i) => (
                <motion.div key={loan.id}
                  className="rounded-2xl p-4 cursor-pointer group"
                  style={{ background: '#12122a', border: '2px solid rgba(0,255,136,0.15)', transition: 'all 0.2s' }}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                  whileHover={{ scale: 1.02, boxShadow: '0 0 24px rgba(0,255,136,0.15)' }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(0,255,136,0.4)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(0,255,136,0.15)')}
                  onClick={() => setSelected(loan)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="badge-purple font-bold">🪙 ${loan.collateral_token_symbol}</span>
                      <span className="text-xs font-body" style={{ color: '#6666aa' }}>
                        {loan.collateral_amount.toLocaleString()} tokens
                      </span>
                    </div>
                    <motion.button
                      className="btn-meme text-xs px-4 py-1.5 font-meme tracking-wide opacity-0 group-hover:opacity-100"
                      style={{ transition: 'opacity 0.2s' }}
                      whileHover={{ scale: 1.05 }}
                    >
                      🤑 LEND
                    </motion.button>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-center text-xs font-body">
                    <StatBox label="Loan"  value={formatBNB(loan.loan_amount_bnb)} neon="#00d4ff" />
                    <StatBox label="APR"   value={`${loan.interest_rate_pct}%`}    neon="#ffe600" />
                    <StatBox label="Days"  value={`${loan.loan_duration_days}d`}   neon="#00ff88" />
                    <StatBox label="Addr"  value={`${loan.borrower_address.slice(0,6)}…`} />
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* My lending */}
        <div>
          <h2 className="font-meme text-xl text-white mb-4 tracking-wide">💼 MY LENDS</h2>
          {myLoans?.lending?.length ? (
            <div className="space-y-3">
              {myLoans.lending.map(c => (
                <div key={c.id} className="rounded-2xl p-4 text-xs font-body space-y-2"
                     style={{ background: '#12122a', border: '2px solid rgba(0,255,136,0.2)' }}>
                  <div className="flex justify-between items-center">
                    <span className="badge-purple font-bold">🪙 {c.collateral_token}</span>
                    <span className={STATUS_BADGE[c.status] ?? 'badge-purple'}>{c.status}</span>
                  </div>
                  <InfoRow label="Lent"   value={formatBNB(c.loan_amount_bnb)} />
                  <InfoRow label="Return" value={formatBNB(c.total_repayment_bnb)} neon="#00ff88" />
                  <InfoRow label="Due"    value={new Date(c.due_date).toLocaleDateString()} />
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl p-12 flex flex-col items-center gap-3 text-center"
                 style={{ background: '#12122a', border: '2px solid rgba(0,255,136,0.15)' }}>
              <span className="text-4xl">🤑</span>
              <p className="font-meme text-lg text-white">NO ACTIVE LENDS</p>
              <p className="text-sm font-body" style={{ color: '#6666aa' }}>Pick a request on the left!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function InfoRow({ label, value, neon }: { label: string; value: string; neon?: string }) {
  return (
    <div className="flex justify-between">
      <span style={{ color: '#6666aa' }}>{label}</span>
      <span className="font-mono font-semibold" style={{ color: neon ?? '#c8c8e8' }}>{value}</span>
    </div>
  )
}
function StatBox({ label, value, neon }: { label: string; value: string; neon?: string }) {
  return (
    <div className="rounded-xl py-2" style={{ background: 'rgba(255,255,255,0.03)' }}>
      <div className="mb-0.5" style={{ color: '#6666aa' }}>{label}</div>
      <div className="font-semibold" style={{ color: neon ?? '#c8c8e8' }}>{value}</div>
    </div>
  )
}
