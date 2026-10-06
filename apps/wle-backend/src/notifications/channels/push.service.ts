import { Injectable } from '@nestjs/common';

@Injectable()
export class PushService {
  async send(payload: { deviceToken: string; title: string; body: string }) {
    // Integrate with Firebase FCM or APNS
    console.log('PUSH SENT:', payload);
    return true;
  }
}
