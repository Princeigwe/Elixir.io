import { Controller, UseGuards, Get, Request } from '@nestjs/common';
import {RoomService} from '../services/room.service'
import {JwtAuthGuard} from '../../auth/guards/jwt-auth.guard'
import { ApiOperation, ApiTags } from '@nestjs/swagger';


@ApiTags('Conversations')
@Controller('rooms')
export class RoomController {
    constructor(private roomService: RoomService){}

    @ApiOperation({description: "Get conversation rooms of the patient or medical provider. This is basically to get room details to engage in a conversation between the medical provider and the patient."})
    @UseGuards(JwtAuthGuard)
    @Get()
    async getConversationRoomsOfLoggedInPatientOrMedicalProvider( @Request() request) {
        const user = request.user
        return await this.roomService.getConversationRoomsOfLoggedInPatientOrMedicalProvider(user)
    }
}
