import { Controller, Post, Body, Get, Query, Request, Render } from '@nestjs/common';
import { TokenService } from './token.service';
import { PasswordResetDto } from './dtos/password.reset.dto';
const url = require('url');
import { ConfirmPasswordResetDto } from './dtos/confirm.password.dto';
import { ApiTags, ApiOperation, ApiBody} from '@nestjs/swagger';

@ApiTags('Token')
@Controller('token')
export class TokenController {
    constructor(private tokenService: TokenService){}

    @ApiOperation({description: "This endpoint allows the user request for a password reset token, with email address"})
    @ApiBody({type: PasswordResetDto})
    @Post('forgot-password')
    async sendForgotPasswordEmail( @Body() body: PasswordResetDto ) {
        return await this.tokenService.sendForgotPasswordEmail(body.email)
    }

    @ApiOperation({description: "After the user clicks on the token from email, it takes them to the password reset page."})
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

    @ApiOperation({description: "This endpoint confirms the user's new password with the reset token"})
    @Post('confirm-password')
    async confirmPasswordReset( @Body() body: ConfirmPasswordResetDto ) {
        return await this.tokenService.confirmPasswordReset( body.token, body.password, body.confirmPassword )
    }
}
