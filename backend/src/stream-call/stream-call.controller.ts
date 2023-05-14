import { Controller, Render, Get } from '@nestjs/common';

@Controller('stream-call')
export class StreamCallController {

    @Get()
    @Render('stream_call')
    async openStreamCallPage() {}

}
