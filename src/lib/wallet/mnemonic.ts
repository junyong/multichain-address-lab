import { generateMnemonic, mnemonicToEntropy } from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english.js';

export function normalizeMnemonic(value: string): string {
	return value.normalize('NFKD').trim().split(/\s+/u).filter(Boolean).join(' ');
}

export function isValidMnemonic(value: string): boolean {
	try {
		mnemonicToEntropy(normalizeMnemonic(value), wordlist);
		return true;
	} catch {
		return false;
	}
}

export function createMnemonic(): string {
	const mnemonic = generateMnemonic(wordlist, 128);
	if (!isValidMnemonic(mnemonic)) throw new Error('생성한 mnemonic 검증에 실패했습니다.');
	return mnemonic;
}

export function parseMaxIndex(value: string): number {
	if (!/^(0|[1-9]\d{0,2})$/.test(value)) {
		throw new Error('maxIndex는 0부터 100 사이의 10진수 정수여야 합니다.');
	}
	const index = Number(value);
	if (index > 100) throw new Error('maxIndex는 100을 초과할 수 없습니다.');
	return index;
}
