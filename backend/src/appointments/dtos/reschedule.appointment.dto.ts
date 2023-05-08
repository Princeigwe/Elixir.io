import { IsDate, IsNotEmpty } from "class-validator";
import {Type} from 'class-transformer'


export class RescheduleAppointmentDto {

    @IsDate()
    @IsNotEmpty()
    @Type(() => Date) // to parse date in request body
    date: Date

}