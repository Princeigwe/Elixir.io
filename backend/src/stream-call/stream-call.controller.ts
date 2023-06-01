import { Controller, Render, Get, Post, Body, Request, UseGuards, Param, HttpException, HttpStatus } from '@nestjs/common';
import {CreateSessionDto } from './dtos/create.session.dto'
import {StreamCallService} from './stream-call.service'
import {JwtAuthGuard} from '../auth/guards/jwt-auth.guard'
import { ConfigDailyDomainDto } from './dtos/config.Daily.domain.dto';
import {Roles} from '../roles.decorator'
import {Role} from '../enums/role.enum'
import { RolesGuard } from '../roles.guard';

@Controller('stream-call')
export class StreamCallController {

    constructor(
        private streamCallService: StreamCallService
    ) {}


    @Get('/:cipher/:key/:code')
    @Render('stream_call')
    async streamCall( ) {}

    @Get('/agora')
    @Render('stream_call_agora')
    async streamCallAgora( ) {}


    @UseGuards(JwtAuthGuard, RolesGuard)
    @Post('configure-daily-domain')
    @Roles(Role.Admin)
    async configureDailyDomainByAdmin(@Body() body: ConfigDailyDomainDto) {
        return await this.streamCallService.configureDailyDomainByAdmin(body.enable_advanced_chat, body.enable_people_ui)
    }


    // @Get('/:sessionID')
    // async generateToken( @Param('sessionID') sessionID: string ){
    //     return await this.streamCallService.generateToken(sessionID)
    // }

}
