import { Controller, Get, Body, Post, UseGuards, Request, Response } from '@nestjs/common';
import { AuthService } from './auth.service';
import {RegisterUserDto} from './dtos/registerUser.dto'
import { LocalAuthGuard } from './guards/local-auth.guard';


@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post('register-user')
    async registerUser(@Body() body: RegisterUserDto) {
        return this.authService.registerUser(body.email, body.password)
    }


    @UseGuards(LocalAuthGuard)
    @Post('login')
    async login(@Request() request, @Response() response) {
        const user = request.user;
        const cookie = await this.authService.putJwtInCookieOnLogin(user.id)
        response.setHeader('Set-Cookie', cookie)
        return response.send(user)
    }
}
