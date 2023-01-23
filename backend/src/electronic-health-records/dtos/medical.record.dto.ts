import { IsOptional, IsEmail, IsString, IsNumber, IsArray } from "class-validator"


export class MedicalRecordDto {

    @IsArray()
    complaints: string[]

    @IsArray()
    history_of_illness: string[]

    @IsArray()
    vital_signs: string[]

    @IsArray()
    @IsOptional()
    medical_allergies: string[]

    @IsArray()
    @IsOptional()
    habits: string[]

}

