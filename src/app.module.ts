import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { VerifyModule } from './verify/verify.module';

@Module({
  imports: [
    VerifyModule,   // <-- this activates your new verification endpoints
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
