import { hexQuantityToBigInt } from '$lib/crypto/encoding.js';
import { isValidTronAddress, tronAddressToAbiWord } from '$lib/crypto/tron.js';
import { ChainRequestError } from './errors.js';
import { formatUnits } from './format.js';
import { postTextWithFallback, postWithFallback } from './http.js';
import type { AssetBalance, ChainConfig, TokenConfig } from './types.js';

interface TronConstantResponse {
	result?: { result?: boolean; message?: string };
	constant_result?: string[];
}

export function validateTronAddress(address: string): boolean {
	return isValidTronAddress(address);
}

export function parseTronBalanceResponse(responseText: string): bigint {
	let parsed: unknown;
	try {
		parsed = JSON.parse(responseText);
	} catch {
		throw new ChainRequestError(
			'invalid_response',
			'TRON RPC가 올바른 JSON을 반환하지 않았습니다.'
		);
	}
	if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
		throw new ChainRequestError('invalid_response', 'TRON account 응답 형식이 올바르지 않습니다.');
	}
	const match = responseText.match(/"balance"\s*:\s*(-?\d+)/);
	return match ? BigInt(match[1]) : 0n;
}

export async function getTronNativeBalance(
	chain: ChainConfig,
	address: string,
	signal?: AbortSignal
): Promise<AssetBalance> {
	const responseText = await postTextWithFallback(
		chain.endpoints,
		'/wallet/getaccount',
		{ address, visible: true },
		signal
	);
	const raw = parseTronBalanceResponse(responseText);
	return {
		symbol: chain.nativeSymbol,
		name: chain.name,
		raw: raw.toString(),
		formatted: formatUnits(raw, chain.nativeDecimals),
		decimals: chain.nativeDecimals
	};
}

export async function getTrc20Balance(
	chain: ChainConfig,
	address: string,
	token: TokenConfig,
	signal?: AbortSignal
): Promise<AssetBalance> {
	const response = await postWithFallback<TronConstantResponse>(
		chain.endpoints,
		'/wallet/triggerconstantcontract',
		{
			owner_address: address,
			contract_address: token.address,
			function_selector: 'balanceOf(address)',
			parameter: tronAddressToAbiWord(address),
			visible: true
		},
		signal
	);
	if (response.result?.result === false) {
		throw new ChainRequestError(
			'rpc_error',
			response.result.message ?? 'TRON constant call이 실패했습니다.'
		);
	}
	const value = response.constant_result?.[0];
	if (!value) throw new ChainRequestError('invalid_response', 'TRON RPC 응답에 잔액이 없습니다.');
	const raw = hexQuantityToBigInt(`0x${value.replace(/^0x/, '')}`);
	return {
		symbol: token.symbol,
		name: token.name,
		raw: raw.toString(),
		formatted: formatUnits(raw, token.decimals),
		decimals: token.decimals
	};
}
