import { bytesToHex, hexToBytes } from '@noble/hashes/utils.js';
import { keccak_256 } from '@noble/hashes/sha3.js';

const EVM_ADDRESS = /^0x[0-9a-fA-F]{40}$/;

export function toHex(value: Uint8Array, prefix = true): string {
	const hex = bytesToHex(value);
	return prefix ? `0x${hex}` : hex;
}

export function toChecksumAddress(value: string | Uint8Array): string {
	const lower = (
		typeof value === 'string' ? value.replace(/^0x/, '') : bytesToHex(value)
	).toLowerCase();
	if (!/^[0-9a-f]{40}$/.test(lower)) throw new Error('EVM 주소는 20바이트여야 합니다.');

	const hash = bytesToHex(keccak_256(new TextEncoder().encode(lower)));
	let result = '0x';
	for (let index = 0; index < lower.length; index += 1) {
		const character = lower[index];
		result += Number.parseInt(hash[index], 16) >= 8 ? character.toUpperCase() : character;
	}
	return result;
}

export function isValidEvmAddress(value: string): boolean {
	if (!EVM_ADDRESS.test(value)) return false;
	const body = value.slice(2);
	if (body === body.toLowerCase() || body === body.toUpperCase()) return true;
	return toChecksumAddress(value) === value;
}

export function publicKeyToEvmAddress(uncompressedPublicKey: Uint8Array): string {
	if (uncompressedPublicKey.length !== 65 || uncompressedPublicKey[0] !== 4) {
		throw new Error('압축되지 않은 secp256k1 public key가 필요합니다.');
	}
	return toChecksumAddress(keccak_256(uncompressedPublicKey.slice(1)).slice(-20));
}

export function evmAddressToAbiWord(address: string): string {
	if (!isValidEvmAddress(address)) throw new Error('유효하지 않은 EVM 주소입니다.');
	return address.slice(2).toLowerCase().padStart(64, '0');
}

export function hexQuantityToBigInt(value: unknown): bigint {
	if (typeof value !== 'string' || !/^0x[0-9a-fA-F]+$/.test(value)) {
		throw new Error('RPC가 올바른 hex quantity를 반환하지 않았습니다.');
	}
	return BigInt(value);
}

export function hexToFixedBytes(value: string, length: number): Uint8Array {
	const bytes = hexToBytes(value.replace(/^0x/, ''));
	if (bytes.length !== length) throw new Error(`${length}바이트 값이 필요합니다.`);
	return bytes;
}
