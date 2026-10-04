import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailService {
  async send(payload: { to: string; subject: string; body: string }) {
    // Integrate with SendGrid, SES, Mailgun, etc.
    console.log('EMAIL SENT:', payload);
    return true;
  }
}
