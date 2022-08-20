import {IsString, IsNotEmpty} from 'class-validator';

export class CreateUserDto {

    @IsNotEmpty()
    @IsString()
    readonly email: string;

    @IsNotEmpty()
    @IsString()
    readonly password: string;
}