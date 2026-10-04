export type WeatherAlertRecord = {
  id: string;
  alertId: string;
  zoneId: string;
  alertType: string;
  severity: string;
  headline: string;
  description: string;
  effectiveAt: Date;
  expiresAt: Date | null;
  lastSentAt: Date | null;
  rawCapXml: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type WalletWeatherAlertView = {
  alert_type: string;
  severity: string;
  headline: string;
  description: string;
  expires_at: string | null;
};
