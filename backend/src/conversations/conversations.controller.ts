import { Controller, Get, Render } from '@nestjs/common';

@Controller('conversations')
export class ConversationsController {

    @Get('page')
    @Render('conversations')
    async conversationsPage() {

    }
}
