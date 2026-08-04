import { ChainRequestError } from './errors.js';

const TIMEOUT_MS = 10_000;

async function requestWithFallback(
	endpoints: readonly string[],
	path: string,
	body: unknown,
	signal?: AbortSignal
): Promise<Response> {
	let lastError: unknown;
	for (const endpoint of endpoints) {
		if (signal?.aborted) throw signal.reason;
		try {
			const timeoutSignal = AbortSignal.timeout(TIMEOUT_MS);
			const requestSignal = signal ? AbortSignal.any([signal, timeoutSignal]) : timeoutSignal;
			const response = await fetch(`${endpoint}${path}`, {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify(body),
				signal: requestSignal
			});
			if (response.status === 403)
				throw new ChainRequestError('forbidden', 'RPC 요청이 거부되었습니다 (403).');
			if (response.status === 429)
				throw new ChainRequestError('rate_limited', 'RPC 요청 한도를 초과했습니다 (429).');
			if (!response.ok)
				throw new ChainRequestError('network', `RPC HTTP 오류 (${response.status}).`);
			return response;
		} catch (error) {
			if (signal?.aborted) throw signal.reason;
			if (error instanceof DOMException && error.name === 'TimeoutError') {
				lastError = new ChainRequestError('timeout', 'RPC 요청 시간이 10초를 초과했습니다.');
			} else {
				lastError = error;
			}
		}
	}
	if (lastError instanceof ChainRequestError) throw lastError;
	throw new ChainRequestError('network', '사용 가능한 RPC endpoint가 없습니다.');
}

export async function postWithFallback<T>(
	endpoints: readonly string[],
	path: string,
	body: unknown,
	signal?: AbortSignal
): Promise<T> {
	return (await (await requestWithFallback(endpoints, path, body, signal)).json()) as T;
}

export async function postTextWithFallback(
	endpoints: readonly string[],
	path: string,
	body: unknown,
	signal?: AbortSignal
): Promise<string> {
	return (await requestWithFallback(endpoints, path, body, signal)).text();
}
