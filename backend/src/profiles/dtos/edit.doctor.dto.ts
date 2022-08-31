import {IsString, IsOptional, IsEnum, IsNumber} from 'class-validator'
import {MaritalStatus} from '../../enums/marital.status.enum'

export class EditDoctorDto {

    @IsString()
    @IsOptional()
    firstName: string;

    @IsString()
    @IsOptional()
    lastName: string;

    @IsNumber()
    @IsOptional()
    age: number;

    @IsString()
    @IsOptional()
    address: string;

    @IsString()
    @IsOptional()
    telephone: string;

    @IsEnum(MaritalStatus)
    @IsOptional()
    maritalStatus: MaritalStatus;

    @IsString({each: true}) // validate each item in the array
    @IsOptional()
    specialties: string[];

    @IsString({each: true})
    @IsOptional()
    certificates: string[];

    @IsNumber()
    @IsOptional()
    yearsOfExperience: number

    @IsString({each: true}) // validate each item in the array
    @IsOptional()
    languages: string[];

}