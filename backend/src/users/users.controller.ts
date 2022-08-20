import { Controller, Post, Get, Delete, Body } from '@nestjs/common';
import {UsersService} from '../users/users.service'
import {CreateUserDto} from '../users/dtos/createUser.dto'

@Controller('users')
export class UsersController {
    constructor(private usersService: UsersService) {}

    @Post()
    async createUser(@Body() body: CreateUserDto) {
        return await this.usersService.createUser(body.email, body.password)
    }

    @Get()
    async getUsers() {
        return await this.usersService.getUsers()
    }
}
