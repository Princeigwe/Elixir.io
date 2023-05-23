import { Controller, Render, Get, Post, Body, Request, UseGuards, Param, HttpException, HttpStatus } from '@nestjs/common';
import {CreateSessionDto } from './dtos/create.session.dto'
import {StreamCallService} from './stream-call.service'
import {JwtAuthGuard} from '../auth/guards/jwt-auth.guard'

@Controller('stream-call')
export class StreamCallController {

    constructor(
        // private streamCallService: StreamCallService
    ) {}


    @Get('/:cipher/:key/:code')
    @Render('stream_call')
    async streamCall( ) {}


    // @Get('/:sessionID')
    // async generateToken( @Param('sessionID') sessionID: string ){
    //     return await this.streamCallService.generateToken(sessionID)
    // }

}
