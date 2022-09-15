import { IsOptional, IsString, IsEnum, IsNumber } from "class-validator";
import {MaritalStatus} from '../../enums/marital.status.enum'
import {ApiProperty} from '@nestjs/swagger'


export class EditPatientDto {

    @ApiProperty()
    @IsOptional()
    @IsString()
    firstName: string

    @ApiProperty()
    @IsOptional()
    @IsString()
    lastName: string

    @ApiProperty()
    @IsOptional()
    @IsNumber()
    age: number

    @ApiProperty()
    @IsOptional()
    @IsString()
    address: string

    @ApiProperty()
    @IsOptional()
    @IsString()
    telephone: string

    @ApiProperty()
    @IsOptional()
    @IsString()
    occupation: string

    @ApiProperty({description: "[Single, Married, Divorced, Engaged, Complicated]", example: "Divorced"})
    @IsOptional()
    @IsEnum(MaritalStatus)
    maritalStatus: MaritalStatus
}