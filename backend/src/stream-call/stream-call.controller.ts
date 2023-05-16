import { Controller, Render, Get, Post, Body, Request, UseGuards, Param, HttpException, HttpStatus } from '@nestjs/common';
import {CreateSessionDto } from './dtos/create.session.dto'
import {StreamCallService} from './stream-call.service'
import {JwtAuthGuard} from '../auth/guards/jwt-auth.guard'

@Controller('stream-call')
export class StreamCallController {

    constructor(
        private streamCallService: StreamCallService
    ) {}

    // @Get()
    // @Render('stream_call')
    // async openStreamCallPage() {}


    @Get('/:cipher/:key/:code')
    @Render('stream_call')
    async streamCall( ) {
        // if( typeof window !== 'undefined') {
        //     const path = window.location.pathname;
        //     const parts = path.split('/');
        //     const cipher = parts[1]; // The cipher value
        //     const key = parts[2]; // The key value
        //     const code = parts[3]; // The code value

        //     return {
        //         cipher: cipher, //apiKey
        //         key: key, // sessionID
        //         code: code // token
        //     }
        // }

        // else{
        //     throw new HttpException('Error: Video Conferencing Not Supported', HttpStatus.BAD_REQUEST)
        // }
        
    }

    @Post()
    async createSession(@Body() body: CreateSessionDto) {
        return await this.streamCallService.createSession(body.patientEmail, body.doctorEmail)
    }

    // @UseGuards(JwtAuthGuard)
    // @Get('my-doctor')
    // @Render('stream_call')
    // async joinStreamCallAsPatient( @Request() request ){
    //     const user = request.user
    //     const { sessionID, token } = await this.streamCallService.joinStreamCallAsPatient(user)
    //     const vonageVideoAPIKey = process.env.VONAGE_VIDEO_API_KEY
    //     return { sessionID, token, vonageVideoAPIKey }
    // }


    // @UseGuards(JwtAuthGuard)
    @Get('my-doctor')
    @Render('stream_call')
    async joinStreamCallAsPatient( @Request() request ){

    }

    @Get('/:sessionID')
    async generateToken( @Param('sessionID') sessionID: string ){
        return await this.streamCallService.generateToken(sessionID)
    }

}
