import { Injectable } from '@nestjs/common';

@Injectable()
export class SmsService {
  async send(payload: { to: string; message: string }) {
    // Integrate with Twilio, AWS SNS, etc.
    console.log('SMS SENT:', payload);
    return true;
  }
}
