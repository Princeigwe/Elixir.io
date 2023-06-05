import {IsString, IsNotEmpty, IsEnum} from 'class-validator'
import {DoctorHierarchy} from '../../enums/doctor.hierarchy.enum'
import {MedicalDepartments} from '../../enums/medical.department.enum'
import { ApiProperty } from '@nestjs/swagger'


export class PromoteDemoteDoctorHierarchyDto {

    @ApiProperty({description: "first name of the doctor"})
    @IsNotEmpty()
    @IsString()
    firstName: string

    @ApiProperty({description: "last name of the doctor"})
    @IsNotEmpty()
    @IsString()
    lastName: string

    @ApiProperty({description: "email address of the doctor"})
    @IsNotEmpty()
    @IsString()
    email: string

    @ApiProperty({description: "medical department the doctor belongs to"})
    @IsNotEmpty()
    @IsEnum(MedicalDepartments)
    department: MedicalDepartments

    @ApiProperty({description: "hierarchy to promote/demote the doctor to"})
    @IsNotEmpty()
    @IsEnum(DoctorHierarchy)
    hierarchy: DoctorHierarchy
}
