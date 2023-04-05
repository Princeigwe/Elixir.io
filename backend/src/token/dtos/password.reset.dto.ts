import { IsEmail, IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class PasswordResetDto { 
    @ApiProperty({description: "The user's email address"})
    @IsNotEmpty()
    @IsEmail()
    email: string;
}