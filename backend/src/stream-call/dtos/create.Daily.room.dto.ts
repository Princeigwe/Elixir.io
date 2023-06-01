import { IsString, IsNotEmpty } from "class-validator";

export class CreateDailyRoomDto {

    @IsString()
    @IsNotEmpty()
    patientEmail: string


    @IsString()
    @IsNotEmpty()
    doctorEmail: string

    @IsString()
    @IsNotEmpty()
    appointment_id: string
}