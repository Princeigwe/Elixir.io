import { Module } from '@nestjs/common';
import { ConversationsGateway } from './conversations.gateway';
import { ConversationsController } from './conversations.controller';
import {Room, RoomSchema} from './schemas/room.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { RoomService } from './services/room.service';
import { RoomController } from './controllers/room.controller';
import {Message, MessageSchema} from './schemas/message.schema'
import { MessageService } from './services/message.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {name: Room.name, schema: RoomSchema},
      {name: Message.name, schema: MessageSchema}
    ])
  ],
  providers: [ConversationsGateway, RoomService, MessageService],
  controllers: [ConversationsController, RoomController],
  exports: [RoomService, MessageService]
})
export class ConversationsModule {}
