import { IsOptional, IsString, IsEnum, IsNumber } from "class-validator";
import {MaritalStatus} from '../../enums/marital.status.enum'


export class EditPatientDto {

    @IsOptional()
    @IsString()
    firstName: string

    @IsOptional()
    @IsString()
    lastName: string

    @IsOptional()
    @IsNumber()
    age: number

    @IsOptional()
    @IsString()
    address: string

    @IsOptional()
    @IsString()
    telephone: string

    @IsOptional()
    @IsString()
    occupation: string

    @IsOptional()
    @IsEnum(MaritalStatus)
    maritalStatus: MaritalStatus
}