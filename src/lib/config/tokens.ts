import type { TokenConfig } from '$lib/chain/types.js';

// Verified 2026-08-03 against mainnet contract metadata and issuer/explorer references.
export const ETHEREUM_TOKENS = [
	{
		standard: 'ERC-20',
		symbol: 'USDT',
		name: 'Tether USD',
		address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
		decimals: 6
	}
] as const satisfies readonly TokenConfig[];

export const BSC_TOKENS = [
	{
		standard: 'ERC-20',
		symbol: 'USDT',
		name: 'Binance-Peg BSC-USD',
		address: '0x55d398326f99059fF775485246999027B3197955',
		decimals: 18
	}
] as const satisfies readonly TokenConfig[];

export const TRON_TOKENS = [
	{
		standard: 'TRC-20',
		symbol: 'USDT',
		name: 'Tether USD',
		address: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
		decimals: 6
	}
] as const satisfies readonly TokenConfig[];
