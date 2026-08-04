import { expect, test } from '@playwright/test';

const TEST_EVM = '0x410C42220e8d538eB811B55bfC45B8BAacFc400A';

test('converts EVM address to TRON address on the convert document', async ({ page }) => {
	await page.goto('/convert/');
	await page.getByLabel('주소 입력').fill(TEST_EVM);
	await page.getByRole('button', { name: '변환 실행' }).click();

	await expect(page.getByText('EVM Hex 입력 감지')).toBeVisible();
	await expect(page.getByText('TronWeb.address.fromHex() 결과')).toBeVisible();
});
