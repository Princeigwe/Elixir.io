import {IsNotEmpty, IsString, IsEmail} from 'class-validator'
import {ApiProperty} from '@nestjs/swagger'

// dto for user and admin registration
export class RegisterUserAdminDto {

    @ApiProperty()
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    password: string;
}