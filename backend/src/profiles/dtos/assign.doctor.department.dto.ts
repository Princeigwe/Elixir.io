import {IsEnum, IsNotEmpty} from 'class-validator'
import {MedicalDepartments} from '../../enums/medical.department.enum'

export class AssignDoctorToDepartmentDto { 
    @IsEnum(MedicalDepartments)
    @IsNotEmpty()
    department: MedicalDepartments
}