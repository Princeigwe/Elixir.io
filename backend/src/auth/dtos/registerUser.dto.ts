import {IsNotEmpty, IsString} from 'class-validator'

// dto for user and admin registration
export class RegisterUserAdminDto {

    @IsString()
    @IsNotEmpty()
    email: string;

    @IsNotEmpty()
    @IsString()
    password: string;
}