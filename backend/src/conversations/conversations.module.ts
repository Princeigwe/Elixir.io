import { Module } from '@nestjs/common';
import { ConversationsGateway } from './conversations.gateway';
import { ConversationsController } from './conversations.controller';
import {Room, RoomSchema} from './schemas/room.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { RoomService } from './services/room.service';
import { RoomController } from './controllers/room.controller';
import {Message, MessageSchema} from './schemas/message.schema'
import { MessageService } from './services/message.service';
import { ConversationsService } from './services/conversations.service';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants'



@Module({
  imports: [
    MongooseModule.forFeature([
      {name: Room.name, schema: RoomSchema},
      {name: Message.name, schema: MessageSchema}
    ]),
    UsersModule,
    JwtModule.register({ 
      secret: jwtConstants.secret, 
      signOptions: { 
        expiresIn: '86400s' // the signed jwt token will expire in 86400 seconds (1 day)
      },
    })
  ],
  providers: [ConversationsGateway, RoomService, MessageService, ConversationsService],
  controllers: [ConversationsController, RoomController],
  exports: [RoomService, MessageService]
})
export class ConversationsModule {}
