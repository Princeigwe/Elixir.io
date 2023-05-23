import { IsDate, IsNotEmpty } from "class-validator";
import {Type} from 'class-transformer'
import { ApiProperty } from "@nestjs/swagger";


export class RescheduleAppointmentDto {

    @ApiProperty({description: "Date of the appointment", example: "2023-05-22T20:40:00Z"})
    @IsDate()
    @IsNotEmpty()
    @Type(() => Date) // to parse date in request body
    date: Date

}