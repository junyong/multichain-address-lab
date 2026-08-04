import { afterEach, describe, expect, test } from 'vitest';
import { formatUnits } from './format.js';
import { postWithFallback } from './http.js';
import { parseTronBalanceResponse } from './tron.js';

const originalFetch = globalThis.fetch;
afterEach(() => {
	globalThis.fetch = originalFetch;
});

describe('exact unit formatting', () => {
	test.each([
		[1_234_567n, 6, '1.234567'],
		[1_000_000n, 6, '1'],
		[1_000_000_000_000_000_001n, 18, '1.000000000000000001'],
		[0n, 18, '0']
	])('formats %s with %s decimals', (value, decimals, expected) => {
		expect(formatUnits(value, decimals)).toBe(expected);
	});

	test('parses a TRON balance without JSON number precision loss', () => {
		expect(parseTronBalanceResponse('{"address":"41aa","balance":90071992547409931234}')).toBe(
			90_071_992_547_409_931_234n
		);
		expect(parseTronBalanceResponse('{}')).toBe(0n);
	});
});

describe('RPC fallback', () => {
	test('uses the fallback once after a 429', async () => {
		const calls: Array<[RequestInfo | URL, RequestInit | undefined]> = [];
		globalThis.fetch = async (input, init) => {
			calls.push([input, init]);
			return calls.length === 1
				? new Response('', { status: 429 })
				: Response.json({ result: '0x0' });
		};

		await expect(
			postWithFallback(['https://one.example', 'https://two.example'], '', {})
		).resolves.toEqual({ result: '0x0' });
		expect(calls).toHaveLength(2);
	});

	test('does not include unrelated secret fields in the request', async () => {
		let requestInit: RequestInit | undefined;
		globalThis.fetch = async (_input, init) => {
			requestInit = init;
			return Response.json({ result: '0x0' });
		};
		await postWithFallback(['https://rpc.example'], '', {
			method: 'eth_getBalance',
			params: ['0xabc']
		});
		expect(String(requestInit?.body)).not.toMatch(/mnemonic|private.?key|seed/i);
	});
});
