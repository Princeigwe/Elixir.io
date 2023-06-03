import { Controller, Post, Get, Delete, Body, Query, Param, HttpException, HttpStatus, UseInterceptors, UseGuards } from '@nestjs/common';
import {UsersService} from './users.service'
import {CreateUserDto} from './dtos/createUser.dto'
import {ApiTags, ApiParam, ApiResponse, ApiQuery} from '@nestjs/swagger'
import {SanitizeMongooseModelInterceptor} from 'nestjs-mongoose-exclude'
import {JwtAuthGuard} from '../auth/guards/jwt-auth.guard'
import {RolesGuard} from '../roles.guard'
import {Roles} from '../roles.decorator'
import { Role } from '../enums/role.enum';

@ApiTags('Users') // grouping the users endpoints for Swagger

@UseInterceptors(new SanitizeMongooseModelInterceptor) // hides user password
@Controller('users')
export class UsersController {
    constructor(private usersService: UsersService) {}

    // @Post()
    // async createUser(@Body() body: CreateUserDto) {
    //     return await this.usersService.createUser(body.email, body.password)
    // }

    // details on user ObjectID parameter for Swagger
    @ApiParam({ 
        name: '_id',
        required: false,
        description: "This is the ObjectId of the user in the database",
    })

    // details on GET user response for Swagger
    @ApiResponse({
        status: 404,
        description: "Returns a  'User Not Found' error "
    })
    @ApiResponse({ 
        status: 200,
        description: " Returns a user object from the database "
    })
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.Admin)
    @Get(':_id')
    async getUserByID(@Param('_id') _id:any ) {
        return await this.usersService.getUserByID(_id)
    }


    @ApiQuery({ 
        name: 'email',
        required: false,
        description: 'queries a user by email address'
    })
    @ApiResponse({ 
        status: 200,
        description: " Returns all users in the database"
    })
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.Admin)
    @Get()
    async getUsers(@Query('email') email?: string) {
        if (email) {return await this.usersService.getUserByEmail(email)}
        return await this.usersService.getUsers()
    }


    @ApiParam({ 
        name: '_id',
        required: false,
        description: "Deletes user by ObjectId",
    })
    @ApiResponse({ 
        status: 204,
        description: " No Content"
    })
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.Admin)
    @Delete(':_id')
    async deleteUserByID(@Param('_id') _id:any) {
        await this.usersService.deleteUserByID(_id)
        throw new HttpException('Users Deleted', HttpStatus.NO_CONTENT) 
    }


    @ApiQuery({ 
        name: 'email',
        required: false,
        description: "Deletes a user by email address"
    })
    @ApiResponse({ 
        status: 204,
        description: " No Content"
    })
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.Admin)
    @Delete()
    async deleteUsers(@Query('email') email: string) {
        if (email) {
            await this.usersService.deleteUserByEmail(email)
            throw new HttpException('User Deleted', HttpStatus.NO_CONTENT) 
        }
        await this.usersService.deleteUsers()
        throw new HttpException('Users Deleted', HttpStatus.NO_CONTENT) 
    }

    // @Delete()
    // async deleteUserByEmail(@Query('email') email: string) {
    //     await this.usersService.deleteUserByEmail(email)
    //     return {message: 'User Deleted'}
    // }
}
