export function formatUnits(value: bigint, decimals: number): string {
	if (!Number.isInteger(decimals) || decimals < 0) throw new Error('올바르지 않은 decimals입니다.');
	const negative = value < 0n;
	const absolute = negative ? -value : value;
	const digits = absolute.toString().padStart(decimals + 1, '0');
	if (decimals === 0) return `${negative ? '-' : ''}${digits}`;
	const integer = digits.slice(0, -decimals);
	const fraction = digits.slice(-decimals).replace(/0+$/, '');
	return `${negative ? '-' : ''}${integer}${fraction ? `.${fraction}` : ''}`;
}
