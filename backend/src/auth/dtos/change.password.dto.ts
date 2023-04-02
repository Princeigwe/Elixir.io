import { IsString, IsNotEmpty } from "class-validator";

export class ChangePasswordDto {  

    @IsString()
    @IsNotEmpty()
    password: string;

    @IsString()
    @IsNotEmpty()
    confirmPassword: string;
}