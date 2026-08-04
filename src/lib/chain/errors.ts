import type { ChainErrorCode } from './types.js';

export class ChainRequestError extends Error {
	constructor(
		public readonly code: ChainErrorCode,
		message: string
	) {
		super(message);
		this.name = 'ChainRequestError';
	}
}

export function userMessage(error: unknown): string {
	if (error instanceof ChainRequestError) return error.message;
	if (error instanceof Error) return error.message;
	return '알 수 없는 오류가 발생했습니다.';
}
