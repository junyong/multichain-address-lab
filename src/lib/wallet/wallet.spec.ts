import { describe, expect, test } from 'vitest';
import { deriveEvmAccounts } from './evm-hd.js';
import { createMnemonic, isValidMnemonic, normalizeMnemonic, parseMaxIndex } from './mnemonic.js';
import { deriveTronAccounts } from './tron-address.js';

const TEST_MNEMONIC = 'test test test test test test test test test test test junk';

describe('mnemonic', () => {
	test('generates a valid 12-word English mnemonic', () => {
		const mnemonic = createMnemonic();
		expect(mnemonic.split(' ')).toHaveLength(12);
		expect(isValidMnemonic(mnemonic)).toBe(true);
	});

	test('normalizes whitespace and rejects bad checksums', () => {
		expect(normalizeMnemonic(`  ${TEST_MNEMONIC.replaceAll(' ', '  ')}  `)).toBe(TEST_MNEMONIC);
		expect(isValidMnemonic('test '.repeat(12).trim())).toBe(false);
	});

	test.each([
		['0', 0],
		['10', 10],
		['100', 100]
	])('accepts maxIndex %s', (value, expected) => {
		expect(parseMaxIndex(value)).toBe(expected);
	});

	test.each(['-1', '1.5', '1e2', '+1', '', '101', '01'])('rejects maxIndex %s', (value) => {
		expect(() => parseMaxIndex(value)).toThrow();
	});
});

describe('HD derivation', () => {
	test('matches the known Hardhat EVM account vector', () => {
		const [account] = deriveEvmAccounts(TEST_MNEMONIC, 0);
		expect(account).toEqual({
			index: 0,
			path: "m/44'/60'/0'/0/0",
			address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
			privateKey: '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'
		});
	});

	test('derives inclusive indexes and deterministic results', () => {
		const first = deriveEvmAccounts(TEST_MNEMONIC, 10);
		const second = deriveEvmAccounts(TEST_MNEMONIC, 10);
		expect(first).toHaveLength(11);
		expect(second[10]).toEqual(first[10]);
	});

	test('matches the fixed TRON coin-type 195 vector', () => {
		const [account] = deriveTronAccounts(TEST_MNEMONIC, 0);
		expect(account.path).toBe("m/44'/195'/0'/0/0");
		expect(account.address).toBe('TWer2Ygk5TEheHp3TPuYeqxmB6SsGZmaL6');
		expect(account.evmAddress).toMatch(/^0x[0-9a-fA-F]{40}$/);
	});
});
