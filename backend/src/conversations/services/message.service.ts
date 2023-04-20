import { Injectable } from '@nestjs/common';
import {Message, MessageDocument} from '../schemas/message.schema'
import {Model} from 'mongoose'
import { InjectModel } from '@nestjs/mongoose';
import {RoomService} from '../services/room.service'
import {Room} from '../schemas/room.schema'

@Injectable()
export class MessageService {
    constructor(
        @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
        private roomService: RoomService
    ) {}


    async saveConversationRoomMessage( content: any, conversationRoomName: string, sender?: string ) {
        const conversationRoom = await this.roomService.getConversationRoomByName(conversationRoomName)
        const message = await this.messageModel.create({ content: content, sender: sender, conversationRoom: conversationRoom})
        message.save()
    }


    async loadConversationRoomMessages(conversationRoomName: string) {
        const conversationRoom = await this.roomService.getConversationRoomByName(conversationRoomName)
        const messages = await this.messageModel.find({conversationRoom: conversationRoom._id})
        return messages
    }
}
