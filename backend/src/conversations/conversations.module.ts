import { Module } from '@nestjs/common';
import { ConversationsGateway } from './conversations.gateway';
import { ConversationsController } from './conversations.controller';
import {Room, RoomSchema} from './schemas/room.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { RoomService } from './services/room.service';
import { RoomController } from './controllers/room.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      {name: Room.name, schema: RoomSchema}
    ])
  ],
  providers: [ConversationsGateway, RoomService],
  controllers: [ConversationsController, RoomController]
})
export class ConversationsModule {}
