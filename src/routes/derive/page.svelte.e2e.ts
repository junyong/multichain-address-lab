import { expect, test } from '@playwright/test';

const TEST_MNEMONIC = 'test test test test test test test test test test test junk';

test('keeps private keys out of the DOM until explicit confirmation', async ({ page }) => {
	await page.goto('/derive/');
	await page.getByRole('tab', { name: 'EVM 주소·키' }).click();
	await page.getByLabel('영어 BIP-39 mnemonic').first().fill(TEST_MNEMONIC);
	await page.getByLabel('maxIndex').first().fill('0');
	await page.getByRole('button', { name: 'EVM 파생' }).click();
	await expect(page.locator('[data-sensitive-value]')).toHaveCount(0);
	await page.getByRole('button', { name: 'index 0 private key 보기' }).click();
	await page.getByRole('button', { name: '위험을 이해하고 보기' }).click();
	await expect(page.locator('[data-sensitive-value]')).toHaveCount(1);
	await page.reload();
	await page.getByRole('tab', { name: 'EVM 주소·키' }).click();
	await expect(page.getByLabel('영어 BIP-39 mnemonic').first()).toHaveValue('');
});

test('blocks network connections on the derive document', async ({ page }) => {
	await page.goto('/derive/');
	const connected = await page.evaluate(async () => {
		try {
			await fetch('https://example.com/');
			return true;
		} catch {
			return false;
		}
	});
	expect(connected).toBe(false);
});
