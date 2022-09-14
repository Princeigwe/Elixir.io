import { Controller, Post, Get, Delete, Body, Query, Param, HttpException, HttpStatus } from '@nestjs/common';
import {UsersService} from './users.service'
import {CreateUserDto} from './dtos/createUser.dto'

@Controller('users')
export class UsersController {
    constructor(private usersService: UsersService) {}

    // @Post()
    // async createUser(@Body() body: CreateUserDto) {
    //     return await this.usersService.createUser(body.email, body.password)
    // }

    @Get(':_id')
    async getUserByID(@Param('_id') _id:any ) {
        return await this.usersService.getUserByID(_id)
    }

    @Get()
    async getUsers(@Query('email') email?: string) {
        if (email) {return await this.usersService.getUserByEmail(email)}
        return await this.usersService.getUsers()
    }

    @Delete(':_id')
    async deleteUserByID(@Param('_id') _id:any) {
        await this.usersService.deleteUserByID(_id)
        return {message: 'User Deleted'}
    }

    @Delete()
    async deleteUsers(@Query('email') email: string) {
        if (email) {
            await this.usersService.deleteUserByEmail(email)
            throw new HttpException('User Deleted', HttpStatus.NO_CONTENT) 
        }
        await this.usersService.deleteUsers()
        return {message: 'Users Deleted'}
    }

    // @Delete()
    // async deleteUserByEmail(@Query('email') email: string) {
    //     await this.usersService.deleteUserByEmail(email)
    //     return {message: 'User Deleted'}
    // }
}
