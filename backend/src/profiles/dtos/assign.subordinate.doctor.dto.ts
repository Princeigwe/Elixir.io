import {IsNotEmpty, IsString} from 'class-validator'

export class AssignSubordinateDoctorToPatientDto {

    @IsNotEmpty()
    @IsString()
    subDoctorFirstName: string

    @IsNotEmpty()
    @IsString()
    subDoctorLastName:string
}