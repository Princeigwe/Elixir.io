import {IsString, IsOptional, IsEnum, IsNumber} from 'class-validator'
import {MaritalStatus} from '../../enums/marital.status.enum'
import {ApiProperty} from '@nestjs/swagger'

export class EditDoctorDto {

    @ApiProperty()
    @IsNumber()
    @IsOptional()
    age: number;

    @ApiProperty()
    @IsString()
    @IsOptional()
    address: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    telephone: string;

    @ApiProperty({description: "[Single, Married, Divorced, Engaged, Complicated]", example: "Divorced"})
    @IsEnum(MaritalStatus)
    @IsOptional()
    maritalStatus: MaritalStatus;

    @ApiProperty()
    @IsString({each: true}) // validate each item in the array
    @IsOptional()
    specialties: string[];

    @ApiProperty()
    @IsString({each: true})
    @IsOptional()
    certificates: string[];

    @ApiProperty()
    @IsNumber()
    @IsOptional()
    yearsOfExperience: number

    @ApiProperty()
    @IsString({each: true}) // validate each item in the array
    @IsOptional()
    languages: string[];

}