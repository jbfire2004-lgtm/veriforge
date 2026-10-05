import { Module } from '@nestjs/common';
import { ChatEncryptionService } from './chat-encryption.service';

@Module({
  providers: [ChatEncryptionService],
  exports: [ChatEncryptionService],
})
export class ChatEncryptionModule {}
