import {IsEnum, IsNotEmpty, MaxLength} from 'class-validator'
import {MedicalDepartments} from '../../enums/medical.department.enum'

export class CreateMedicalDepartmentDto {

    @IsEnum(MedicalDepartments)
    @IsNotEmpty()
    name: MedicalDepartments;
}