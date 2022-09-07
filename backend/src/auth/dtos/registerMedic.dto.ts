import {IsEnum, IsNotEmpty, IsOptional, IsString} from 'class-validator'
import {DoctorHierarchy} from '../../enums/doctor.hierarchy.enum'
import {MedicalDepartments} from '../../enums/medical.department.enum'

// dto for user and admin registration
export class RegisterUserConsultantDto {

    @IsString()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    firstName: string;

    @IsNotEmpty()
    @IsString()
    lastName: string;

    @IsNotEmpty()
    @IsString()
    password: string;

}


export class RegisterUserDoctorDto {

    @IsString()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    firstName: string;

    @IsNotEmpty()
    @IsString()
    lastName: string;

    @IsNotEmpty()
    @IsString()
    password: string;

    @IsEnum(MedicalDepartments)
    @IsNotEmpty()
    department: MedicalDepartments

    @IsOptional()
    @IsEnum(DoctorHierarchy)
    hierarchy: DoctorHierarchy

}