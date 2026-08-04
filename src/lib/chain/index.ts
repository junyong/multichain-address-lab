import { getErc20Balance, getEvmNativeBalance, validateEvmAddress } from './evm.js';
import { userMessage } from './errors.js';
import { getTrc20Balance, getTronNativeBalance, validateTronAddress } from './tron.js';
import type { BalanceLookupResult, ChainConfig } from './types.js';

export function validateAddress(chain: ChainConfig, address: string): boolean {
	return chain.kind === 'evm' ? validateEvmAddress(address) : validateTronAddress(address);
}

export async function lookupBalances(
	chain: ChainConfig,
	address: string,
	signal?: AbortSignal
): Promise<BalanceLookupResult> {
	const requests = [
		chain.kind === 'evm'
			? getEvmNativeBalance(chain, address, signal)
			: getTronNativeBalance(chain, address, signal),
		...chain.tokens.map((token) =>
			chain.kind === 'evm'
				? getErc20Balance(chain, address, token, signal)
				: getTrc20Balance(chain, address, token, signal)
		)
	];
	const labels = [chain.nativeSymbol, ...chain.tokens.map((token) => token.symbol)];
	const settled = await Promise.allSettled(requests);
	return settled.reduce<BalanceLookupResult>(
		(result, item, index) => {
			if (item.status === 'fulfilled') result.balances.push(item.value);
			else result.failures.push({ symbol: labels[index], message: userMessage(item.reason) });
			return result;
		},
		{ balances: [], failures: [] }
	);
}

export type { AssetBalance, BalanceLookupResult, ChainConfig, ChainKey } from './types.js';
