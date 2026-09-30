import type { Page } from '@playwright/test';

export async function completeSignupWizard(
  page: Page,
  opts: {
    companyName: string;
    ownerName: string;
    email: string;
    password?: string;
    modules?: Array<'vericore' | 'veripm' | 'verihub'>;
  },
) {
  const password = opts.password ?? 'Str0ng!Passw0rd';

  await page.goto('/signup');
  await page.getByTestId('signup-company-name').fill(opts.companyName);
  await page.getByTestId('signup-owner-name').fill(opts.ownerName);
  await page.getByTestId('signup-owner-email').fill(opts.email);
  await page.getByTestId('signup-password').fill(password);
  await page.getByRole('button', { name: 'Continue' }).click();

  await page.getByTestId('signup-modules-step').waitFor();
  // Ensure vericore stays selected; optionally enable others
  for (const code of opts.modules ?? ['vericore', 'veripm']) {
    const box = page.getByTestId(`module-checkbox-${code}`);
    if (!(await box.isChecked())) await box.check();
  }
  await page.getByRole('button', { name: 'Continue' }).click();

  // Billing cycle step
  await page.getByRole('button', { name: 'Continue' }).click();

  // Confirm
  await page.getByRole('button', { name: /Start 7-day trial/i }).click();
  await page.waitForURL('**/dashboard');
}
