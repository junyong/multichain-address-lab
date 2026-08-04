import { describe, expect, test } from 'vitest';
import { decodeTronAddress, isValidTronAddress } from './tron.js';
import { isValidEvmAddress, toChecksumAddress } from './encoding.js';

describe('address validation', () => {
	test('normalizes and validates EIP-55 addresses', () => {
		const address = toChecksumAddress('0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266');
		expect(address).toBe('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266');
		expect(isValidEvmAddress(address)).toBe(true);
		expect(isValidEvmAddress('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92267')).toBe(false);
	});

	test('validates TRON checksum and mainnet prefix', () => {
		const address = 'TWer2Ygk5TEheHp3TPuYeqxmB6SsGZmaL6';
		expect(isValidTronAddress(address)).toBe(true);
		expect(decodeTronAddress(address)).toHaveLength(21);
		expect(isValidTronAddress(`${address.slice(0, -1)}7`)).toBe(false);
	});
});
