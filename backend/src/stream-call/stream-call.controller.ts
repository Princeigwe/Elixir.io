import { Controller, Render, Get, Post, Body, Request, UseGuards, Param, HttpException, HttpStatus } from '@nestjs/common';
import {CreateSessionDto } from './dtos/create.session.dto'
import {StreamCallService} from './stream-call.service'
import {JwtAuthGuard} from '../auth/guards/jwt-auth.guard'
import { ConfigDailyDomainDto } from './dtos/config.Daily.domain.dto';
import {Roles} from '../roles.decorator'
import {Role} from '../enums/role.enum'
import { RolesGuard } from '../roles.guard';
import { CreateDailyRoomDto } from './dtos/create.Daily.room.dto'
import {CreateDailyRoomTokenDto } from './dtos/create.Daily.room.token.dto'
import { ApiOperation, ApiBody, ApiTags } from '@nestjs/swagger';

@ApiTags('Stream Call')
@Controller('stream-call')
export class StreamCallController {

    constructor(
        private streamCallService: StreamCallService
    ) {}


    @ApiOperation({description: "Endpoint to go on stream call. This endpoint is called from the user's email address"})
    @Get('/:room/:token')
    @Render('stream_call_daily')
    async streamCallDaily(@Param('room') room: string, @Param('token') token: string) {
        const dailyDomain = process.env.DAILY_DOMAIN
        return { room: room, token: token, dailyDomain: dailyDomain }
    }


    @ApiOperation({description: "Endpoint to configure stream call feature by the admin. Reference to ConfigDailyDomainDto."})
    @ApiBody({type: ConfigDailyDomainDto})
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Post('configure-daily-domain')
    @Roles(Role.Admin)
    async configureDailyDomainByAdmin(@Body() body: ConfigDailyDomainDto) {
        return await this.streamCallService.configureDailyDomainByAdmin(body.enable_advanced_chat, body.enable_people_ui)
    }

    // @Post('create-daily-room')
    // async createDailySessionRoom(@Body() body: CreateDailyRoomDto) {
    //     return await this.streamCallService.createDailySessionRoom(body.patientEmail, body.doctorEmail, body.appointment_id)
    // }

    // @Post('create-daily-room-token')
    // async createDailyRoomWithMeetingToken(@Body() body: CreateDailyRoomTokenDto) {
    //     return await this.streamCallService.createMeetingTokenForDailyRoom(body.roomName, body.roomExp)
    // }



}
