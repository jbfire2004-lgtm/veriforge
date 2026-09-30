import { expect, test } from '@playwright/test';
import { completeSignupWizard } from './helpers/auth';

test.describe('Subscription activation', () => {
  test('activation flow with mocked convert API', async ({ page }) => {
    const ts = Date.now();
    await completeSignupWizard(page, {
      companyName: `Billing Co ${ts}`,
      ownerName: 'Billing Owner',
      email: `billing-${ts}@veriforge.test`,
    });

    await page.route('**/organizations/*/billing/convert', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ok: true,
          subscriptionStatus: 'active',
        }),
      });
    });

    // Soft-mock session refresh so UI can proceed without Stripe
    await page.route('**/auth/me', async (route) => {
      const response = await route.fetch();
      const json = await response.json();
      json.organization = {
        ...json.organization,
        isTrialActive: false,
      };
      json.subscriptionStatus = 'active';
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(json),
      });
    });

    await page.getByTestId('trial-banner').getByRole('link', { name: /Activate/i }).click();
    await expect(page.getByTestId('activate-subscription-page')).toBeVisible();
    await page.getByTestId('activate-subscription-btn').click();
    await expect(page).toHaveURL(/\/dashboard/);
  });
});
