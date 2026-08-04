import { HDKey } from '@scure/bip32';
import { mnemonicToSeedSync } from '@scure/bip39';
import { secp256k1 } from '@noble/curves/secp256k1.js';
import { publicKeyToEvmAddress } from '$lib/crypto/encoding.js';
import { publicKeyToTronAddress } from '$lib/crypto/tron.js';
import { isValidMnemonic, normalizeMnemonic } from './mnemonic.js';

export interface TronDerivedAccount {
	index: number;
	path: string;
	address: string;
	evmAddress: string;
}

export function deriveTronAccounts(mnemonic: string, maxIndex: number): TronDerivedAccount[] {
	const normalized = normalizeMnemonic(mnemonic);
	if (!isValidMnemonic(normalized)) throw new Error('유효한 영어 BIP-39 mnemonic을 입력하세요.');
	if (!Number.isInteger(maxIndex) || maxIndex < 0 || maxIndex > 100) {
		throw new Error('maxIndex는 0부터 100 사이의 정수여야 합니다.');
	}

	const root = HDKey.fromMasterSeed(mnemonicToSeedSync(normalized));
	const accounts: TronDerivedAccount[] = [];
	try {
		const parent = root.derive("m/44'/195'/0'/0");
		for (let index = 0; index <= maxIndex; index += 1) {
			const path = `m/44'/195'/0'/0/${index}`;
			const privateKey = parent.deriveChild(index).privateKey;
			if (!privateKey) throw new Error(`${path} private key를 파생하지 못했습니다.`);
			const publicKey = secp256k1.getPublicKey(privateKey, false);
			accounts.push({
				index,
				path,
				address: publicKeyToTronAddress(publicKey),
				evmAddress: publicKeyToEvmAddress(publicKey)
			});
		}
	} finally {
		root.wipePrivateData();
	}
	return accounts;
}
