import { hexToBytes, bytesToHex } from '@noble/hashes/utils.js';
import { base58check } from '@scure/base';
import { sha256 } from '@noble/hashes/sha2.js';
import { toChecksumAddress } from './encoding.js';

const tronBase58 = base58check(sha256);

export interface AddressConversionResult {
	input: string;
	inputType: 'evm' | 'tron_base58' | 'tron_hex';
	evmChecksumAddress: string;
	evmRawHex: string;
	tronBase58Address: string;
	tronHexAddress: string;
	abiWord: string;
}

export function convertAddress(input: string): AddressConversionResult {
	const trimmed = input.trim();
	if (!trimmed) {
		throw new Error('주소를 입력하세요.');
	}

	// 1. TRON Base58Check (T로 시작하는 34자)
	if (trimmed.startsWith('T') && trimmed.length === 34) {
		try {
			const payload = tronBase58.decode(trimmed);
			if (payload.length !== 21 || payload[0] !== 0x41) {
				throw new Error('유효하지 않은 TRON Mainnet 주소입니다.');
			}
			const rawBytes = payload.slice(1);
			const evmChecksumAddress = toChecksumAddress(rawBytes);
			const evmRaw = bytesToHex(rawBytes);
			const tronHexAddress = bytesToHex(payload);
			const abiWord = evmRaw.padStart(64, '0');

			return {
				input: trimmed,
				inputType: 'tron_base58',
				evmChecksumAddress,
				evmRawHex: `0x${evmRaw}`,
				tronBase58Address: trimmed,
				tronHexAddress,
				abiWord
			};
		} catch (cause) {
			if (cause instanceof Error && cause.message.includes('TRON')) throw cause;
			throw new Error('TRON Base58Check 주소 디코딩에 실패했습니다.', { cause });
		}
	}

	const clean = trimmed.startsWith('0x') || trimmed.startsWith('0X') ? trimmed.slice(2) : trimmed;

	// 2. EVM Hex 주소 (0x 포함 42자 또는 미포함 40자 헥스)
	if (clean.length === 40 && /^[0-9a-fA-F]{40}$/.test(clean)) {
		const rawBytes = hexToBytes(clean);
		const evmChecksumAddress = toChecksumAddress(rawBytes);
		const evmRawHex = `0x${clean.toLowerCase()}`;

		const payload = new Uint8Array(21);
		payload[0] = 0x41;
		payload.set(rawBytes, 1);

		const tronBase58Address = tronBase58.encode(payload);
		const tronHexAddress = bytesToHex(payload);
		const abiWord = clean.toLowerCase().padStart(64, '0');

		return {
			input: trimmed,
			inputType: 'evm',
			evmChecksumAddress,
			evmRawHex,
			tronBase58Address,
			tronHexAddress,
			abiWord
		};
	}

	// 3. TRON Hex (41로 시작하는 42자 헥스)
	if (
		clean.length === 42 &&
		clean.toLowerCase().startsWith('41') &&
		/^[0-9a-fA-F]{42}$/.test(clean)
	) {
		const payload = hexToBytes(clean);
		if (payload[0] !== 0x41) {
			throw new Error('TRON Hex 주소는 41로 시작해야 합니다.');
		}
		const rawBytes = payload.slice(1);
		const evmChecksumAddress = toChecksumAddress(rawBytes);
		const evmRawHex = `0x${bytesToHex(rawBytes)}`;
		const tronBase58Address = tronBase58.encode(payload);
		const abiWord = bytesToHex(rawBytes).padStart(64, '0');

		return {
			input: trimmed,
			inputType: 'tron_hex',
			evmChecksumAddress,
			evmRawHex,
			tronBase58Address,
			tronHexAddress: clean.toLowerCase(),
			abiWord
		};
	}

	throw new Error(
		'지원하지 않는 주소 형식입니다. EVM 주소(0x…), TRON 주소(T…), 또는 TRON Hex(41…)를 입력하세요.'
	);
}
