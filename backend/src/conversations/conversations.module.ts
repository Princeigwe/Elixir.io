import { Module } from '@nestjs/common';
import { ConversationsGateway } from './conversations.gateway';
import { ConversationsController } from './conversations.controller';

@Module({
  providers: [ConversationsGateway],
  controllers: [ConversationsController]
})
export class ConversationsModule {}
