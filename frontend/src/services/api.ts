const BASE_URL = '/api'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail || 'Request failed')
  }
  return res.json()
}

// ── Fund API ──────────────────────────────────────────────
export const fundApi = {
  getStats: ()                    => request<FundStats>('/fund/stats'),
  getPortfolio: ()                => request<Portfolio>('/fund/portfolio'),
  getTransactions: (limit = 20)   => request<FundTx[]>(`/fund/transactions?limit=${limit}`),
  getMyInvestment: (addr: string) => request<MyInvestment>(`/fund/my-investment/${addr}`),
  invest: (data: InvestPayload)   => request<{ success: boolean; message: string }>('/fund/invest', { method: 'POST', body: JSON.stringify(data) }),
}

// ── Lending API ──────────────────────────────────────────
export const lendingApi = {
  getRequests: (status = 'open', limit = 20) => request<LoanRequest[]>(`/lending/requests?status=${status}&limit=${limit}`),
  createRequest: (data: CreateLoanRequest)   => request<CreateLoanResponse>('/lending/requests', { method: 'POST', body: JSON.stringify(data) }),
  createOffer: (data: CreateLoanOffer)        => request<CreateOfferResponse>('/lending/offers', { method: 'POST', body: JSON.stringify(data) }),
  getMyLoans: (addr: string)                  => request<MyLoans>(`/lending/my-loans/${addr}`),
}

// ── Sophia API ───────────────────────────────────────────
export const sophiaApi = {
  getActivities: (limit = 10)         => request<Activity[]>(`/sophia/activities?limit=${limit}`),
  getReports: (limit = 10)            => request<Report[]>(`/sophia/reports?limit=${limit}`),
  getReportDetail: (id: number)       => request<ReportDetail>(`/sophia/reports/${id}`),
  generateReport: (symbol: string)    => request<{ success: boolean; report_id: number }>(`/sophia/generate-report/${symbol}`, { method: 'POST' }),
}

// ── Types ─────────────────────────────────────────────────
export interface FundStats {
  total_invested_bnb: number
  total_portfolio_value_usd: number
  total_profit_loss_usd: number
  profit_loss_pct: number
  cash_available_bnb: number
  num_investors: number
}

export interface Portfolio {
  address: string
  bnb_balance: number
  tabby_balance: number
  tokens: TokenBalance[]
}

export interface TokenBalance {
  symbol: string
  balance: number
  decimals: number
}

export interface FundTx {
  id: number
  tx_type: string
  token_symbol: string
  amount: number
  price_usd: number | null
  tx_hash: string | null
  description: string | null
  created_at: string
}

export interface MyInvestment {
  wallet_address: string
  total_invested_bnb: number
  num_transactions: number
  transactions: Array<{ amount_bnb: number; tx_hash: string; created_at: string }>
}

export interface InvestPayload {
  wallet_address: string
  amount_bnb: number
  tx_hash: string
}

export interface LoanRequest {
  id: number
  borrower_address: string
  collateral_token_symbol: string
  collateral_token_address: string
  collateral_amount: number
  loan_amount_bnb: number
  loan_duration_days: number
  interest_rate_pct: number
  status: string
  created_at: string
  expires_at: string | null
}

export interface CreateLoanRequest {
  borrower_address: string
  collateral_token_symbol: string
  collateral_token_address: string
  collateral_amount: number
  loan_amount_bnb: number
  loan_duration_days: number
  interest_rate_pct: number
  collateral_tx_hash: string
  notes?: string
}

export interface CreateLoanResponse {
  success: boolean
  loan_id: number
  risk_assessment: Record<string, unknown>
  message: string
}

export interface CreateLoanOffer {
  loan_request_id: number
  lender_address: string
  offered_amount_bnb: number
  proposed_interest_rate_pct?: number
  tx_hash: string
}

export interface CreateOfferResponse {
  success: boolean
  contract_id: number
  total_repayment_bnb: number
  due_date: string
  message: string
}

export interface MyLoans {
  borrowing: LoanContract[]
  lending: LoanContract[]
}

export interface LoanContract {
  id: number
  collateral_token: string
  collateral_amount: number
  loan_amount_bnb: number
  interest_rate_pct: number
  total_repayment_bnb: number
  due_date: string
  status: string
}

export interface Activity {
  id: number
  activity_type: string
  description: string
  token_symbol: string | null
  tx_hash: string | null
  source_url: string | null
  created_at: string
}

export interface Report {
  id: number
  title: string
  token_symbol: string | null
  summary: string
  recommendation: string | null
  risk_level: string | null
  confidence_score: number | null
  published_at: string
}

export interface ReportDetail extends Report {
  full_report: string
  token_address: string | null
}
