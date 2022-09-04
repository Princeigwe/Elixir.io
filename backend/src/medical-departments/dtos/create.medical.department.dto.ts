import {IsString, IsNotEmpty, MaxLength} from 'class-validator'

export class CreateMedicalDepartmentDto {

    @IsString()
    @MaxLength(30, { message: 'Name of department is too long'})
    @IsNotEmpty()
    name: string;
}