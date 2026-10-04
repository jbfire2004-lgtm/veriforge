import { Injectable } from '@nestjs/common';

@Injectable()
export class SettingsService {
  profile(userId: number | null) {
    return {
      userId,
      displayName: 'VeriForge Operator',
      email: 'operator@veriforge.io',
      forgeStatus: 'active',
    };
  }

  updateProfile(input: {
    userId: number | null;
    displayName?: string;
    email?: string;
  }) {
    return {
      userId: input.userId,
      displayName: input.displayName ?? 'VeriForge Operator',
      email: input.email ?? 'operator@veriforge.io',
      forgeStatus: 'forged',
    };
  }

  preferences(userId: number | null) {
    return {
      userId,
      highContrast: true,
      verificationPulseAlerts: true,
      forgeStatus: 'active',
    };
  }

  updatePreferences(input: {
    userId: number | null;
    highContrast?: boolean;
    verificationPulseAlerts?: boolean;
  }) {
    return {
      userId: input.userId,
      highContrast: input.highContrast ?? true,
      verificationPulseAlerts: input.verificationPulseAlerts ?? true,
      forgeStatus: 'forged',
    };
  }
}
