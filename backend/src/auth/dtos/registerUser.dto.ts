import {IsNotEmpty, IsString} from 'class-validator'

export class RegisterUserDto {

    @IsString()
    @IsNotEmpty()
    email: string;

    @IsNotEmpty()
    @IsString()
    password: string;
}