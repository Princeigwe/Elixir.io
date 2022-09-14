import {IsEnum, IsNotEmpty, IsOptional, IsString} from 'class-validator'
import {DoctorHierarchy} from '../../enums/doctor.hierarchy.enum'
import {MedicalDepartments} from '../../enums/medical.department.enum'
import { ApiProperty } from '@nestjs/swagger';

// dto for user and admin registration
export class RegisterUserConsultantDto {

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    email: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    firstName: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    lastName: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    password: string;

}


export class RegisterUserDoctorDto {

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    email: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    firstName: string;

    @IsNotEmpty()
    @IsString()
    lastName: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    password: string;

    @ApiProperty()
    @IsEnum(MedicalDepartments)
    @IsNotEmpty()
    department: MedicalDepartments

    @ApiProperty({
        description: " ['Medical Student','Junior Doctor', 'Associate Specialist'] .Giving data for hierarchy is optional, which sets default to Associate Specialist"
    })
    @IsOptional()
    @IsEnum(DoctorHierarchy)
    hierarchy: DoctorHierarchy

}