import { base58check } from '@scure/base';
import { sha256 } from '@noble/hashes/sha2.js';
import { bytesToHex } from '@noble/hashes/utils.js';
import { keccak_256 } from '@noble/hashes/sha3.js';

const tronBase58 = base58check(sha256);

export function publicKeyToTronAddress(uncompressedPublicKey: Uint8Array): string {
	if (uncompressedPublicKey.length !== 65 || uncompressedPublicKey[0] !== 4) {
		throw new Error('압축되지 않은 secp256k1 public key가 필요합니다.');
	}
	const payload = new Uint8Array(21);
	payload[0] = 0x41;
	payload.set(keccak_256(uncompressedPublicKey.slice(1)).slice(-20), 1);
	return tronBase58.encode(payload);
}

export function decodeTronAddress(value: string): Uint8Array {
	const payload = tronBase58.decode(value);
	if (payload.length !== 21 || payload[0] !== 0x41) {
		throw new Error('TRON Mainnet 주소가 아닙니다.');
	}
	return payload;
}

export function isValidTronAddress(value: string): boolean {
	try {
		decodeTronAddress(value);
		return true;
	} catch {
		return false;
	}
}

export function tronAddressToAbiWord(value: string): string {
	return bytesToHex(decodeTronAddress(value)).padStart(64, '0');
}
