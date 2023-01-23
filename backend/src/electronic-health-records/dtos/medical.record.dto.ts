import { IsOptional, IsEmail, IsString, IsNumber, IsArray } from "class-validator"


export class MedicalRecordDto {

    @IsString()
    firstName: string

    @IsString()
    lastName: string

    @IsEmail()
    email: string

    @IsNumber()
    age: string

    @IsString()
    address: string

    @IsString()
    telephone: string

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

