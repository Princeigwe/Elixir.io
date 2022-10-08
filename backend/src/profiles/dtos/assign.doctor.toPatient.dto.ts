import {IsNotEmpty, IsString} from 'class-validator'
import {ApiProperty} from '@nestjs/swagger'

export class AssignDoctorToPatientDto {

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    doctorFirstName: string

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    doctorLastName:string
}