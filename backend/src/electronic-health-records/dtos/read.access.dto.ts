import { IsEmail } from "class-validator";


export class ReadAccessDto {

    @IsEmail()
    email: string

}