import { IsEmail } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class ReadAccessDto {

    @ApiProperty({description: "The email of the medical provider"})
    @IsEmail()
    email: string

}