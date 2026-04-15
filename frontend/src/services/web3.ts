import { http, createConfig } from 'wagmi'
import { bsc } from 'wagmi/chains'
import { getDefaultConfig } from '@rainbow-me/rainbowkit'

export const chains = [bsc] as const

export const wagmiConfig = getDefaultConfig({
  appName: 'TABBY MEME BANK',
  projectId: 'tabby-meme-bank-2024',  // WalletConnect project ID
  chains,
  transports: {
    [bsc.id]: http('https://bsc-dataseed.binance.org/'),
  },
})

export const TABBY_CONTRACT = '0x319558c8aD708dc42f45ab70eADA4750d6c942d7'
export const SOPHIA_ADDRESS  = '0xaa81ae85ab8284cb7bcb804faa824e5baee83da8'
export const BSC_CHAIN_ID    = 56

// ERC-20 minimal ABI for reading balances
export const ERC20_ABI = [
  { name: 'balanceOf', type: 'function', inputs: [{ name: 'account', type: 'address' }], outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view' },
  { name: 'symbol',    type: 'function', inputs: [], outputs: [{ name: '', type: 'string' }],  stateMutability: 'view' },
  { name: 'decimals',  type: 'function', inputs: [], outputs: [{ name: '', type: 'uint8' }],   stateMutability: 'view' },
  { name: 'transfer',  type: 'function', inputs: [{ name: 'to', type: 'address' }, { name: 'amount', type: 'uint256' }], outputs: [{ name: '', type: 'bool' }], stateMutability: 'nonpayable' },
] as const

export function shortenAddress(address: string, chars = 4): string {
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`
}

export function formatBNB(value: number | string, decimals = 4): string {
  return `${parseFloat(String(value)).toFixed(decimals)} BNB`
}

export function formatUSD(value: number | string): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(Number(value))
}
