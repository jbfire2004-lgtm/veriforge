import {
  equipmentStaffWalletPath,
  equipmentVerifyUrl,
  publicBaseUrl,
  workerStaffWalletPath,
  workerVerifyUrl,
} from './wallet-routes';

describe('wallet-routes', () => {
  it('builds public verify URLs for QR printing', () => {
    expect(workerVerifyUrl(42, 'https://app.example')).toBe(
      'https://app.example/verify/42',
    );
    expect(equipmentVerifyUrl(9, 'https://app.example')).toBe(
      'https://app.example/verify/equipment?id=9',
    );
  });

  it('builds staff wallet paths separately from verify', () => {
    expect(workerStaffWalletPath(1)).toBe('/wallet/1');
    expect(equipmentStaffWalletPath(2)).toBe('/equipment/2/wallet');
    expect(workerStaffWalletPath(1)).not.toContain('/verify/');
  });

  it('defaults public base URL', () => {
    expect(publicBaseUrl()).toMatch(/^https?:\/\//);
  });
});
