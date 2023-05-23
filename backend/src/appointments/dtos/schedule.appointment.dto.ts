import { IsDate, IsString, IsOptional, IsEnum, IsNotEmpty, MaxLength, MinLength, Contains } from "class-validator";
import {AppointmentType} from '../../enums/appointment.type.enum'
import {Type} from 'class-transformer'
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";


export class ScheduleAppointmentDto {

    @ApiPropertyOptional({description: "Any optional reason for the appointment", example: "I accidentally pulled off the bandage"})
    @IsOptional()
    @IsString()
    description: string

    @ApiProperty({description: "The type of appointment. virtual or physical", example: "virtual"})
    @IsOptional()
    @IsEnum(AppointmentType)
    type: AppointmentType

    @ApiProperty({description: "Date of the appointment", example: "2023-05-22T20:40:00Z"})
    @IsDate()
    @IsNotEmpty()
    @Type(() => Date) // to parse date in request body
    date: Date

    @ApiProperty({description: "Duration of the appointment in format HH:MM", example: "04:56"})
    @Contains(':', {message: "Invalid format... example: 04:56"})
    @MaxLength(5, {message: "Can only accept hour and minute values"})
    @MinLength(5, {message: "please include hour value. If duration is not upto an hour, prefix with 00:"})
    @IsString()
    @IsNotEmpty()
    duration: string

}