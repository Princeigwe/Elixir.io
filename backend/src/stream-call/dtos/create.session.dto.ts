import { IsString, IsNotEmpty } from "class-validator";

export class CreateSessionDto {

    @IsString()
    @IsNotEmpty()
    patientEmail: string;


    @IsString()
    @IsNotEmpty()
    doctorEmail: string;
}