import { describe, expect, test } from 'vitest';
import { convertAddress } from './converter.js';

describe('convertAddress', () => {
	const EVM_ADDR = '0x410C42220e8d538eB811B55bfC45B8BAacFc400A';
	const TRON_HEX = '41410c42220e8d538eb811b55bfc45b8baacfc400a';

	test('converts EVM address to TRON Base58 and TRON Hex correctly', () => {
		const result = convertAddress(EVM_ADDR);
		expect(result.inputType).toBe('evm');
		expect(result.evmChecksumAddress).toBe(EVM_ADDR);
		expect(result.tronHexAddress).toBe(TRON_HEX);
		expect(result.tronBase58Address.startsWith('T')).toBe(true);
	});

	test('converts TRON Base58 address back to EVM address', () => {
		const converted = convertAddress(EVM_ADDR);
		const roundtrip = convertAddress(converted.tronBase58Address);

		expect(roundtrip.inputType).toBe('tron_base58');
		expect(roundtrip.evmChecksumAddress).toBe(converted.evmChecksumAddress);
		expect(roundtrip.tronHexAddress).toBe(converted.tronHexAddress);
	});

	test('converts TRON Hex address (41...) correctly', () => {
		const result = convertAddress(TRON_HEX);
		expect(result.inputType).toBe('tron_hex');
		expect(result.evmChecksumAddress).toBe(EVM_ADDR);
		expect(result.tronBase58Address.startsWith('T')).toBe(true);
	});

	test('throws error for invalid input', () => {
		expect(() => convertAddress('invalid')).toThrow('지원하지 않는 주소 형식입니다.');
	});
});
