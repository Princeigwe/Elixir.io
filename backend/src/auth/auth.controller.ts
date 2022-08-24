import { Controller, Get, Body, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import {RegisterUserDto} from './dtos/registerUser.dto'

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post('register-user')
    async registerUser(@Body() body: RegisterUserDto) {
        return this.authService.registerUser(body.email, body.password)
    }
}
