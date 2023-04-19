import { Controller, UseGuards, Get, Request } from '@nestjs/common';
import {RoomService} from '../services/room.service'
import {JwtAuthGuard} from '../../auth/guards/jwt-auth.guard'


@Controller('rooms')
export class RoomController {
    constructor(private roomService: RoomService){}

    @UseGuards(JwtAuthGuard)
    @Get()
    async getConversationRoomsOfLoggedInPatientOrMedicalProvider( @Request() request) {
        const user = request.user
        return await this.roomService.getConversationRoomsOfLoggedInPatientOrMedicalProvider(user)
    }
}
