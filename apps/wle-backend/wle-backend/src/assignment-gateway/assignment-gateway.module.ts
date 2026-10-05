import { Module } from '@nestjs/common';
import { AssignmentGateway } from './assignment.gateway';

@Module({
  providers: [AssignmentGateway],
  exports: [AssignmentGateway],
})
export class AssignmentGatewayModule {}
