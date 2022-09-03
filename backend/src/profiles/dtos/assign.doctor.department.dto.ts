import {IsEnum, IsNotEmpty} from 'class-validator'
import {HospitalDepartments} from '../../enums/department.enum'

export class AssignDoctorToDepartmentDto { 
    @IsEnum(HospitalDepartments)
    @IsNotEmpty()
    department: HospitalDepartments
}