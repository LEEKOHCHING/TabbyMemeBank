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

const STATUS_BADGE: Record<string, string> = { active: 'badge-green', pending: 'badge-yellow', closed: 'badge-purple', defaulted: 'badge-pink' }

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
      <div className="sophia-avatar w-16 h-16 text-3xl mx-auto mb-4 animate-float">🏦</div>
      <h2 className="font-meme text-3xl text-white mb-2 tracking-wide">BORROW BNB</h2>
      <p className="text-sm font-body mb-6" style={{ color: '#6666aa' }}>Connect your BSC wallet to continue</p>
      <ConnectButton />
    </div>
  )

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <motion.div className="flex items-center gap-4 mb-8" initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="sophia-avatar w-12 h-12 text-2xl animate-float">🏦</div>
        <div>
          <h1 className="font-meme text-4xl text-white tracking-wide" style={{ letterSpacing: '0.05em' }}>
            MEME <span className="text-neon-pink">COLLATERAL</span> BORROW
          </h1>
          <p className="text-sm font-body mt-1" style={{ color: '#6666aa' }}>
            💎 Collateralize your Meme tokens, borrow BNB (P2P)
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Borrow Form */}
        <div className="rounded-2xl p-6 space-y-4" style={{ background: '#12122a', border: '2px solid rgba(255,45,120,0.25)' }}>
          <h2 className="font-meme text-xl text-white tracking-wide">📋 SUBMIT REQUEST</h2>

          <div className="rounded-xl p-3 text-xs font-body leading-relaxed"
               style={{ background: 'rgba(255,230,0,0.07)', border: '1px solid rgba(255,230,0,0.25)', color: '#ffe600' }}>
            <AlertTriangle className="w-3.5 h-3.5 inline mr-1.5" />
            Transfer collateral tokens to Sophia's wallet first, then fill the form below
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-body font-semibold block mb-1.5" style={{ color: '#6666aa' }}>🪙 Token Symbol</label>
              <input className="input" placeholder="PEPE" value={form.collateral_token_symbol}
                     onChange={e => upd('collateral_token_symbol', e.target.value.toUpperCase())} />
            </div>
            <div>
              <label className="text-xs font-body font-semibold block mb-1.5" style={{ color: '#6666aa' }}>📦 Collateral Amount</label>
              <input className="input" type="number" placeholder="1000000" value={form.collateral_amount}
                     onChange={e => upd('collateral_amount', e.target.value)} />
            </div>
          </div>

          <div>
            <label className="text-xs font-body font-semibold block mb-1.5" style={{ color: '#6666aa' }}>📍 Token Contract Address</label>
            <input className="input font-mono" placeholder="0x…" value={form.collateral_token_address}
                   onChange={e => upd('collateral_token_address', e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-body font-semibold block mb-1.5" style={{ color: '#6666aa' }}>💰 Loan Amount (BNB)</label>
              <input className="input" type="number" step="0.001" placeholder="0.1" value={form.loan_amount_bnb}
                     onChange={e => upd('loan_amount_bnb', e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-body font-semibold block mb-1.5 flex items-center gap-1" style={{ color: '#6666aa' }}>
                <Percent className="w-3 h-3" /> APR (%)
              </label>
              <input className="input" type="number" step="0.1" placeholder="12" value={form.interest_rate_pct}
                     onChange={e => upd('interest_rate_pct', e.target.value)} />
            </div>
          </div>

          <div>
            <label className="text-xs font-body font-semibold block mb-2 flex items-center gap-1" style={{ color: '#6666aa' }}>
              <Clock className="w-3 h-3" /> Loan Duration
            </label>
            <div className="flex gap-2 flex-wrap">
              {DURATIONS.map(d => (
                <button key={d} type="button" onClick={() => upd('loan_duration_days', d)}
                  className="rounded-xl px-3 py-1.5 text-xs font-body font-semibold transition-all"
                  style={form.loan_duration_days === d
                    ? { background: 'linear-gradient(135deg,#ff2d78,#ff6b00)', color: '#fff', boxShadow: '0 0 12px rgba(255,45,120,0.4)' }
                    : { background: 'rgba(255,255,255,0.04)', border: '1px solid #2a2a55', color: '#6666aa' }
                  }>
                  {d}d
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-body font-semibold block mb-1.5" style={{ color: '#6666aa' }}>🔗 Collateral TX Hash</label>
            <input className="input font-mono" placeholder="0x…" value={form.collateral_tx_hash}
                   onChange={e => upd('collateral_tx_hash', e.target.value)} />
          </div>

          <motion.button
            className="btn-pink w-full font-meme tracking-wide text-base"
            disabled={submit.isPending}
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
            })}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          >
            {submit.isPending ? '⏳ Submitting...' : '🏦 Submit Borrow Request'}
          </motion.button>
        </div>

        {/* My loans */}
        <div>
          <h2 className="font-meme text-xl text-white mb-4 tracking-wide">📂 MY BORROWS</h2>
          {myLoans?.borrowing?.length ? (
            <div className="space-y-3">
              {myLoans.borrowing.map(c => (
                <div key={c.id} className="rounded-2xl p-4 text-xs font-body space-y-2"
                     style={{ background: '#12122a', border: '2px solid rgba(255,45,120,0.2)' }}>
                  <div className="flex justify-between items-center">
                    <span className="badge-cyan font-bold">🪙 {c.collateral_token}</span>
                    <span className={STATUS_BADGE[c.status] ?? 'badge-purple'}>{c.status}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1 mt-2">
                    <InfoRow label="Borrowed" value={formatBNB(c.loan_amount_bnb)} />
                    <InfoRow label="Repay"    value={formatBNB(c.total_repayment_bnb)} neon="#ff2d78" />
                    <InfoRow label="Due"      value={new Date(c.due_date).toLocaleDateString()} />
                    <InfoRow label="APR"      value={`${c.interest_rate_pct}%`} neon="#ffe600" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl p-12 flex flex-col items-center gap-3 text-center"
                 style={{ background: '#12122a', border: '2px solid rgba(255,45,120,0.15)' }}>
              <span className="text-4xl">🏦</span>
              <p className="font-meme text-lg text-white">NO ACTIVE BORROWS</p>
              <p className="text-sm font-body" style={{ color: '#6666aa' }}>Submit a request to get started</p>
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
