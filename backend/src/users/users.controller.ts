import { Controller, Post, Get, Delete, Body, Query } from '@nestjs/common';
import {UsersService} from './users.service'
import {CreateUserDto} from './dtos/createUser.dto'

@Controller('users')
export class UsersController {
    constructor(private usersService: UsersService) {}

    @Post()
    async createUser(@Body() body: CreateUserDto) {
        return await this.usersService.createUser(body.email, body.password)
    }

    @Get()
    async getUsers(@Query('email') email?: string) {
        if (email) {return await this.usersService.getUserByEmail(email)}
        return await this.usersService.getUsers()
    }
}
