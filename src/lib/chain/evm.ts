import {
	evmAddressToAbiWord,
	hexQuantityToBigInt,
	isValidEvmAddress
} from '$lib/crypto/encoding.js';
import { ChainRequestError } from './errors.js';
import { formatUnits } from './format.js';
import { postWithFallback } from './http.js';
import type { AssetBalance, ChainConfig, TokenConfig } from './types.js';

interface JsonRpcResponse {
	result?: unknown;
	error?: { message?: string };
}

let rpcId = 0;

async function rpc(
	chain: ChainConfig,
	method: 'eth_getBalance' | 'eth_call',
	params: unknown[],
	signal?: AbortSignal
): Promise<unknown> {
	const response = await postWithFallback<JsonRpcResponse>(
		chain.endpoints,
		'',
		{ jsonrpc: '2.0', id: (rpcId += 1), method, params },
		signal
	);
	if (response.error)
		throw new ChainRequestError('rpc_error', response.error.message ?? 'EVM RPC 오류입니다.');
	if (response.result === undefined)
		throw new ChainRequestError('invalid_response', 'EVM RPC 응답에 result가 없습니다.');
	return response.result;
}

export function validateEvmAddress(address: string): boolean {
	return isValidEvmAddress(address);
}

export async function getEvmNativeBalance(
	chain: ChainConfig,
	address: string,
	signal?: AbortSignal
): Promise<AssetBalance> {
	const raw = hexQuantityToBigInt(await rpc(chain, 'eth_getBalance', [address, 'latest'], signal));
	return {
		symbol: chain.nativeSymbol,
		name: chain.name,
		raw: raw.toString(),
		formatted: formatUnits(raw, chain.nativeDecimals),
		decimals: chain.nativeDecimals
	};
}

export async function getErc20Balance(
	chain: ChainConfig,
	address: string,
	token: TokenConfig,
	signal?: AbortSignal
): Promise<AssetBalance> {
	const data = `0x70a08231${evmAddressToAbiWord(address)}`;
	const raw = hexQuantityToBigInt(
		await rpc(chain, 'eth_call', [{ to: token.address, data }, 'latest'], signal)
	);
	return {
		symbol: token.symbol,
		name: token.name,
		raw: raw.toString(),
		formatted: formatUnits(raw, token.decimals),
		decimals: token.decimals
	};
}
