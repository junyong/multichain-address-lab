export type ChainKey = 'ethereum' | 'bsc' | 'tron';
export type ChainKind = 'evm' | 'tron';

export interface TokenConfig {
	standard: 'ERC-20' | 'TRC-20';
	symbol: string;
	name: string;
	address: string;
	decimals: number;
}

export interface ChainConfig {
	key: ChainKey;
	kind: ChainKind;
	name: string;
	nativeSymbol: string;
	nativeDecimals: number;
	endpoints: readonly string[];
	tokens: readonly TokenConfig[];
}

export interface AssetBalance {
	symbol: string;
	name: string;
	raw: string;
	formatted: string;
	decimals: number;
}

export interface AssetFailure {
	symbol: string;
	message: string;
}

export interface BalanceLookupResult {
	balances: AssetBalance[];
	failures: AssetFailure[];
}

export type ChainErrorCode =
	'timeout' | 'forbidden' | 'rate_limited' | 'network' | 'invalid_response' | 'rpc_error';
