import { expect, test } from '@playwright/test';
import { completeSignupWizard } from './helpers/auth';

test.describe('Onboarding dashboard + trial banner', () => {
  test('shows trial banner and onboarding after signup', async ({ page }) => {
    const ts = Date.now();
    await completeSignupWizard(page, {
      companyName: `Trial Co ${ts}`,
      ownerName: 'Trial Owner',
      email: `trial-${ts}@veriforge.test`,
    });

    await expect(page.getByTestId('trial-banner')).toContainText(/day/);
    await expect(page.getByTestId('trial-banner').getByRole('link', { name: /Activate/i })).toBeVisible();
    await expect(page.getByTestId('onboarding-dashboard')).toContainText(/Welcome/);
  });
});
