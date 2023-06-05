import {IsString, IsNotEmpty, IsEnum} from 'class-validator'
import {DoctorHierarchy} from '../../enums/doctor.hierarchy.enum'
import {MedicalDepartments} from '../../enums/medical.department.enum'


export class PromoteDemoteDoctorHierarchyDto {

    @IsNotEmpty()
    @IsString()
    firstName: string

    @IsNotEmpty()
    @IsString()
    lastName: string

    @IsNotEmpty()
    @IsString()
    email: string

    @IsNotEmpty()
    @IsEnum(MedicalDepartments)
    department: MedicalDepartments

    @IsNotEmpty()
    @IsEnum(DoctorHierarchy)
    hierarchy: DoctorHierarchy
}
