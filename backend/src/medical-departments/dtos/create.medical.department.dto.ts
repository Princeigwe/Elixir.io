import {IsEnum, IsNotEmpty, MaxLength} from 'class-validator'
import {MedicalDepartments} from '../../enums/medical.department.enum'
import {ApiProperty} from '@nestjs/swagger'

export class CreateMedicalDepartmentDto {

    @ApiProperty({ description: " [ Cardiology, Dermatology, Urology, IntensiveCareMedicine, Neurology, Surgery, Radiology, Pharmacy] "})
    @IsEnum(MedicalDepartments)
    @IsNotEmpty()
    name: MedicalDepartments;
}