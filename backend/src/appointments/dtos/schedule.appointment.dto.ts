import { IsDate, IsString, IsOptional, IsEnum, IsNotEmpty } from "class-validator";
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
    @IsNotEmpty()
    @Type(() => Date) // to parse date in request body
    date: Date

    @IsString()
    @IsNotEmpty()
    duration: string

}