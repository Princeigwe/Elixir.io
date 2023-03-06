import { IsOptional, IsEmail, IsString, IsNumber, IsArray } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"


export class MedicalRecordDto {

    @ApiProperty({description: "the patent's complaints", required: true})
    @IsArray()
    complaints: string[]

    @ApiProperty({description: "the patient's history of illness", required: true})
    @IsArray()
    history_of_illness: string[]

    @ApiProperty({description: "vital signs observed", required: true})
    @IsArray()
    vital_signs: string[]

    @ApiProperty({description: "medical allergies of patient"})
    @IsArray()
    @IsOptional()
    medical_allergies: string[]

    @ApiProperty({description: "habits of patient"})
    @IsArray()
    @IsOptional()
    habits: string[]

}



export class UpdateMedicalRecordDto {

    @IsArray()
    @IsOptional()
    complaints: string[]

    @IsArray()
    @IsOptional()
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

