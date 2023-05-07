import { IsDate, IsString, IsOptional, IsEnum } from "class-validator";
import {AppointmentType} from '../../enums/appointment.type.enum'
import {Type} from 'class-transformer'


export class ScheduleAppointmentDto {

    @IsOptional()
    @IsString()
    description: string

    @IsOptional()
    @IsEnum(AppointmentType)
    type: AppointmentType

    @IsDate()
    @Type(() => Date) // to parse date in request body
    date: Date

    @IsString()
    duration: string

}