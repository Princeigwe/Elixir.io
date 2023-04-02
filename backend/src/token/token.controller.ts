import { Controller, Post, Body, Get, Query, Request, Render } from '@nestjs/common';
import { TokenService } from './token.service';
import { PasswordResetDto } from './dtos/password.reset.dto';
const url = require('url');
import { ConfirmPasswordResetDto } from './dtos/confirm.password.dto';

@Controller('token')
export class TokenController {
    constructor(private tokenService: TokenService){}

    @Post('forgot-password')
    async sendForgotPasswordEmail( @Body() body: PasswordResetDto ) {
        return await this.tokenService.sendForgotPasswordEmail(body.email)
    }

    @Get('password-reset')
    @Render('resetPassword')
    async getPasswordResetToken( @Query('token') token: string, @Request() request ?: Request) { 

        if(typeof window !== 'undefined') { 
            const urlSearchParams = new URLSearchParams(window.location.search);
            token = urlSearchParams.get('token');
            return {token: token}
        }

        else { 
            const queryObject = url.parse(request.url, true).query;
            token = queryObject.token;
            return {token: token}
        }
    }

    @Post('confirm-password')
    async confirmPasswordReset( @Body() body: ConfirmPasswordResetDto ) {
        return await this.tokenService.confirmPasswordReset( body.token, body.password, body.confirmPassword )
    }
}
