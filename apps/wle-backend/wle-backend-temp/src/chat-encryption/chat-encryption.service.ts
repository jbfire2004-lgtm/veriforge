import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class ChatEncryptionService {
  private readonly algorithm = 'aes-256-cbc';
  private readonly key = crypto
    .createHash('sha256')
    .update(process.env.CHAT_SECRET || 'default_chat_secret')
    .digest();
  private readonly ivLength = 16;

  encrypt(text: string) {
    const iv = crypto.randomBytes(this.ivLength);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
    const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
  }

  decrypt(data: string) {
    const [ivHex, encryptedHex] = data.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const encrypted = Buffer.from(encryptedHex, 'hex');
    const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]);
    return decrypted.toString();
  }
}
