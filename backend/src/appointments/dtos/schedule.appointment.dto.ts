import { IsDate, IsString, IsOptional, IsEnum, IsNotEmpty, MaxLength, MinLength, Contains } from "class-validator";
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

    @Contains(':', {message: "Invalid format... example: 04:56"})
    @MaxLength(5, {message: "Can only accept hour and minute values"})
    @MinLength(5, {message: "please include hour value. If duration is not upto an hour, prefix with 00:"})
    @IsString()
    @IsNotEmpty()
    duration: string

}