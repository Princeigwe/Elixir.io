import { Injectable, NotFoundException } from '@nestjs/common';
import { Room, RoomDocument } from '../schemas/room.schema';    
import {OnEvent} from '@nestjs/event-emitter'
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConversationRoomEvent } from '../../events/createConversationRoom.event'
import {User} from '../../users/users.schema'
import {UserCategory} from '../../enums/user.category.enum'
import * as AesEncryption from 'aes-encryption'


const aes = new AesEncryption()
aes.setSecretKey(process.env.ENCRYPTION_KEY || '11122233344455566677788822244455555555555555555231231321313aaaff')



@Injectable()
export class RoomService {
    constructor(
        @InjectModel(Room.name) private roomModel: Model<RoomDocument>
    ){}


    @OnEvent('new.conversation.room')
    async createConversationRoom(payload: ConversationRoomEvent) {
        const existingRoom = await this.roomModel.findOne({name: payload.name}).exec()
        if(!existingRoom) {
            const room = new this.roomModel({name: aes.encrypt(payload.name), patientEmail: aes.encrypt(payload.patientEmail), medicalProviderEmail: aes.encrypt(payload.medicalProviderEmail)})
            room.save()
        }
    }

    @OnEvent('new.consultant.conversation.room')
    async createConsultantConversationRoom(payload: ConversationRoomEvent) {
        const existingRoom = await this.roomModel.findOne({name: payload.name}).exec()
        if(!existingRoom) {
            const room = new this.roomModel({name: aes.encrypt(payload.name), patientEmail: aes.encrypt(payload.patientEmail), medicalProviderEmail: aes.encrypt(payload.medicalProviderEmail)})
            room.save()
        }
    }

    async getConversationRoomsOfLoggedInPatientOrMedicalProvider(user: User) {
        if(user.category == UserCategory.Patient) {
            const conversationRooms = await this.roomModel.find({patientEmail: aes.encrypt(user.email)})
            if(!conversationRooms.length){
                throw new NotFoundException("No conversation rooms found")
            }
            const decryptedConversationRooms = conversationRooms.map( conversationRoom => {
                const decryptedConversationRoomData = {
                    _id: conversationRoom._id.toString(),
                    name: aes.decrypt(conversationRoom.name),
                    patientEmail: aes.decrypt(conversationRoom.patientEmail),
                    medicalProviderEmail: aes.decrypt(conversationRoom.medicalProviderEmail),
                    __v: conversationRoom.__v 
                }

                return decryptedConversationRoomData
            } )

            return decryptedConversationRooms
            // return conversationRooms
        }
        else if( user.category == UserCategory.MedicalProvider) {
            const conversationRooms = await this.roomModel.find({medicalProviderEmail: aes.encrypt(user.email)})
            if(!conversationRooms.length){
                throw new NotFoundException("No conversation rooms found")
            }
            const decryptedConversationRooms = conversationRooms.map( conversationRoom => {
                const decryptedConversationRoomData = {
                    _id: conversationRoom._id.toString(),
                    name: aes.decrypt(conversationRoom.name),
                    patientEmail: aes.decrypt(conversationRoom.patientEmail),
                    medicalProviderEmail: aes.decrypt(conversationRoom.medicalProviderEmail),
                    __v: conversationRoom.__v 
                }

                return decryptedConversationRoomData
            } )

            return decryptedConversationRooms
            // return conversationRooms
        }

        else{
            throw new NotFoundException("No room is assigned to administrative user")
        }
    }

    
    // will be used to load messages attached to the respective room
    async getConversationRoomByName(name:string) {
        const room = await this.roomModel.findOne({ name:name})
        return room
    }
}
