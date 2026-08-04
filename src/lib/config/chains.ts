import type { ChainConfig, ChainKey } from '$lib/chain/types.js';
import { BSC_TOKENS, ETHEREUM_TOKENS, TRON_TOKENS } from './tokens.js';

export const CHAINS: Record<ChainKey, ChainConfig> = {
	ethereum: {
		key: 'ethereum',
		kind: 'evm',
		name: 'Ethereum Mainnet',
		nativeSymbol: 'ETH',
		nativeDecimals: 18,
		endpoints: ['https://ethereum-rpc.publicnode.com', 'https://1rpc.io/eth'],
		tokens: ETHEREUM_TOKENS
	},
	bsc: {
		key: 'bsc',
		kind: 'evm',
		name: 'BSC Mainnet',
		nativeSymbol: 'BNB',
		nativeDecimals: 18,
		endpoints: ['https://bsc-rpc.publicnode.com', 'https://bsc-dataseed.bnbchain.org'],
		tokens: BSC_TOKENS
	},
	tron: {
		key: 'tron',
		kind: 'tron',
		name: 'TRON Mainnet',
		nativeSymbol: 'TRX',
		nativeDecimals: 6,
		endpoints: ['https://api.trongrid.io'],
		tokens: TRON_TOKENS
	}
};

export const CHAIN_OPTIONS = Object.values(CHAINS);
