import { IsNotEmpty, IsString } from "class-validator";

export class ConfirmPasswordResetDto { 

    @IsNotEmpty()
    @IsString()
    token: string;

    @IsNotEmpty()
    @IsString()
    password: string;

    @IsNotEmpty()
    @IsString()
    confirmPassword: string;
}