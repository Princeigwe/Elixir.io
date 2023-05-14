import { Controller, Render, Get, Post, Body } from '@nestjs/common';
import {CreateSessionDto } from './dtos/create.session.dto'
import {StreamCallService} from './stream-call.service'

@Controller('stream-call')
export class StreamCallController {

    constructor(
        private streamCallService: StreamCallService
    ) {}

    @Get()
    @Render('stream_call')
    async openStreamCallPage() {}

    @Post()
    async createSession(@Body() body: CreateSessionDto) {
        return await this.streamCallService.createSession(body.patientEmail, body.doctorEmail)
    }

}
