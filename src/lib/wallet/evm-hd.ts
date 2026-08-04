import { HDKey } from '@scure/bip32';
import { mnemonicToSeedSync } from '@scure/bip39';
import { secp256k1 } from '@noble/curves/secp256k1.js';
import { publicKeyToEvmAddress, toHex } from '$lib/crypto/encoding.js';
import { isValidMnemonic, normalizeMnemonic } from './mnemonic.js';

export interface EvmDerivedAccount {
	index: number;
	path: string;
	address: string;
	privateKey: string;
}

export function deriveEvmAccounts(mnemonic: string, maxIndex: number): EvmDerivedAccount[] {
	const normalized = normalizeMnemonic(mnemonic);
	if (!isValidMnemonic(normalized)) throw new Error('유효한 영어 BIP-39 mnemonic을 입력하세요.');
	if (!Number.isInteger(maxIndex) || maxIndex < 0 || maxIndex > 100) {
		throw new Error('maxIndex는 0부터 100 사이의 정수여야 합니다.');
	}

	const root = HDKey.fromMasterSeed(mnemonicToSeedSync(normalized));
	const accounts: EvmDerivedAccount[] = [];
	try {
		const parent = root.derive("m/44'/60'/0'/0");
		for (let index = 0; index <= maxIndex; index += 1) {
			const path = `m/44'/60'/0'/0/${index}`;
			const privateKey = parent.deriveChild(index).privateKey;
			if (!privateKey) throw new Error(`${path} private key를 파생하지 못했습니다.`);
			accounts.push({
				index,
				path,
				address: publicKeyToEvmAddress(secp256k1.getPublicKey(privateKey, false)),
				privateKey: toHex(privateKey)
			});
		}
	} finally {
		root.wipePrivateData();
	}
	return accounts;
}

export function deriveSingleEvmAccount(mnemonic: string, index: number): EvmDerivedAccount {
	const normalized = normalizeMnemonic(mnemonic);
	if (!isValidMnemonic(normalized)) throw new Error('유효한 영어 BIP-39 mnemonic을 입력하세요.');
	if (!Number.isInteger(index) || index < 0 || index > 1_000_000) {
		throw new Error('index는 0부터 1,000,000 사이의 정수여야 합니다.');
	}

	const root = HDKey.fromMasterSeed(mnemonicToSeedSync(normalized));
	try {
		const parent = root.derive("m/44'/60'/0'/0");
		const path = `m/44'/60'/0'/0/${index}`;
		const privateKey = parent.deriveChild(index).privateKey;
		if (!privateKey) throw new Error(`${path} private key를 파생하지 못했습니다.`);
		return {
			index,
			path,
			address: publicKeyToEvmAddress(secp256k1.getPublicKey(privateKey, false)),
			privateKey: toHex(privateKey)
		};
	} finally {
		root.wipePrivateData();
	}
}
