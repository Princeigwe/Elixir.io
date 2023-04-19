import { Injectable, NotFoundException } from '@nestjs/common';
import { Room, RoomDocument } from '../schemas/room.schema';    
import {OnEvent} from '@nestjs/event-emitter'
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConversationRoomEvent } from '../../events/createConversationRoom.event'
import {User} from '../../users/users.schema'
import {UserCategory} from '../../enums/user.category.enum'





@Injectable()
export class RoomService {
    constructor(
        @InjectModel(Room.name) private roomModel: Model<RoomDocument>
    ){}


    @OnEvent('new.conversation.room')
    async createConversationRoom(payload: ConversationRoomEvent) {
        const room = new this.roomModel({name: payload.name, patientEmail: payload.patientEmail, medicalProviderEmail: payload.medicalProviderEmail})
        room.save()
    }

    async getConversationRoomsOfLoggedInPatientOrMedicalProvider(user: User) {
        if(user.category == UserCategory.Patient) {
            const conversationRooms = await this.roomModel.find({patientEmail: user.email})
            if(!conversationRooms.length){
                throw new NotFoundException("No conversation rooms found")
            }
            return conversationRooms
        }
        else if( user.category == UserCategory.MedicalProvider) {
            const conversationRooms = await this.roomModel.find({medicalProviderEmail: user.email})
            if(!conversationRooms.length){
                throw new NotFoundException("No conversation rooms found")
            }
            return conversationRooms
        }

        else{
            throw new NotFoundException("No room is assigned to administrative user")
        }
    }
}
