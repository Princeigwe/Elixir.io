import {IsNotEmpty, IsString} from 'class-validator'

// dto for user and admin registration
export class RegisterUserMedicDto {

    @IsString()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    firstName: string;

    @IsNotEmpty()
    @IsString()
    lastName: string;

    @IsNotEmpty()
    @IsString()
    password: string;

}