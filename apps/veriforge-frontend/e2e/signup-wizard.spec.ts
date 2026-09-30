import { expect, test } from '@playwright/test';
import { completeSignupWizard } from './helpers/auth';

test.describe('Signup wizard', () => {
  test('company → modules → billing → confirm with pricing preview', async ({ page }) => {
    const ts = Date.now();

    await page.goto('/signup');
    await expect(page.getByTestId('signup-company-step')).toBeVisible();

    await page.getByTestId('signup-company-name').fill(`E2E Co ${ts}`);
    await page.getByTestId('signup-owner-name').fill('E2E Owner');
    await page.getByTestId('signup-owner-email').fill(`e2e-${ts}@veriforge.test`);
    await page.getByTestId('signup-password').fill('Str0ng!Passw0rd');
    await page.getByRole('button', { name: 'Continue' }).click();

    await expect(page.getByTestId('signup-modules-step')).toBeVisible();
    await page.getByTestId('module-checkbox-veripm').check();
    await expect(page.getByTestId('pricing-preview')).toBeVisible();
    await expect(page.getByTestId('pricing-selected-total')).not.toHaveText('—');
    await page.getByRole('button', { name: 'Continue' }).click();

    await page.getByRole('button', { name: 'Continue' }).click();
    await page.getByRole('button', { name: /Start 7-day trial/i }).click();

    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByTestId('onboarding-dashboard')).toBeVisible();
  });

  test('full helper path lands on dashboard', async ({ page }) => {
    const ts = Date.now();
    await completeSignupWizard(page, {
      companyName: `Helper Co ${ts}`,
      ownerName: 'Helper Owner',
      email: `helper-${ts}@veriforge.test`,
      modules: ['vericore'],
    });
    await expect(page.getByTestId('trial-banner')).toBeVisible();
  });
});
