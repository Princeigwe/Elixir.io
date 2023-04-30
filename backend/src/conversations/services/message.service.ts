import { Injectable } from '@nestjs/common';
import {Message, MessageDocument} from '../schemas/message.schema'
import {Model} from 'mongoose'
import { InjectModel } from '@nestjs/mongoose';
import {RoomService} from '../services/room.service'
import * as AesEncryption from 'aes-encryption'


const aes = new AesEncryption()
aes.setSecretKey(process.env.ENCRYPTION_KEY || '11122233344455566677788822244455555555555555555231231321313aaaff')

@Injectable()
export class MessageService {
    constructor(
        @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
        private roomService: RoomService
    ) {}


    /**
     * This function saves an encrypted message with the sender.
     * @param {any} content - The message content that needs to be saved in the database. It can be of
     * any data type, as it is passed as an "any" type in the function signature.
     * @param {string} conversationRoomName - The name of the conversation room where the message will
     * be saved.
     * @param {string} sender - The sender parameter is a string that represents the name or identifier
     * of the user who is sending the message in the conversation room.
     */
    //todo: encrypt conversation room properties
    async saveConversationRoomMessage( content: any, conversationRoomName: string, sender: string ) {
        const conversationRoom = await this.roomService.getConversationRoomByName(conversationRoomName)
        const message = await this.messageModel.create({ content: aes.encrypt(content), sender: aes.encrypt(sender), conversationRoom: conversationRoom})
        message.save()
    }


    async loadConversationRoomMessages(conversationRoomName: string) {
        const conversationRoom = await this.roomService.getConversationRoomByName(conversationRoomName)
        const messages = await this.messageModel.find({conversationRoom: conversationRoom._id})
        const decryptedMessages = messages.map( message => {
            const decryptedData = {
                content:  aes.decrypt(message['content']),
                sender:   aes.decrypt(message['sender']),
                conversationRoom: message.conversationRoom
            }

            return decryptedData
        })
        return decryptedMessages
    }
}
