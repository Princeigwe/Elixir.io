import { Controller, Post, Body, Get, Query, Request } from '@nestjs/common';
import { TokenService } from './token.service';
import { PasswordResetDto } from './dtos/password.reset.dto';
const url = require('url');

@Controller('token')
export class TokenController {
    constructor(private tokenService: TokenService){}

    @Post('forgot-password')
    async sendForgotPasswordEmail( @Body() body: PasswordResetDto ) {
        return await this.tokenService.sendForgotPasswordEmail(body.email)
    }

    @Get('password-reset')
    async getPasswordResetToken( @Query('token') token: string, @Request() request ?: Request) { 

        if(typeof window !== 'undefined') { 
            const urlSearchParams = new URLSearchParams(window.location.search);
            token = urlSearchParams.get('token');
            return token
        }

        else { 
            const queryObject = url.parse(request.url, true).query;
            const resetToken = queryObject.token;
            return resetToken
        }
    }
}
