import { IsOptional, IsArray, ArrayNotEmpty } from "class-validator"
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"


export class MedicalRecordDto {

    @ApiProperty({description: "the patent's complaints", required: true})
    @IsArray()
    @ArrayNotEmpty()
    complaints: string[]

    @ApiProperty({description: "the patient's history of illness", required: true})
    @IsArray()
    @ArrayNotEmpty()
    history_of_illness: string[]

    @ApiProperty({description: "vital signs observed", required: true})
    @IsArray()
    @ArrayNotEmpty()
    vital_signs: string[]

    @ApiPropertyOptional({description: "medical allergies of patient"})
    @IsArray()
    @IsOptional() 
    medical_allergies: string[]

    @ApiPropertyOptional({description: "habits of patient"})
    @IsArray()
    @IsOptional()
    habits: string[]

}



export class UpdateMedicalRecordDto {

    @ApiPropertyOptional({description: "the patent's complaints"})
    @IsArray()
    @IsOptional()
    complaints: string[]

    @ApiPropertyOptional({description: "the patient's history of illness"})
    @IsArray()
    @IsOptional()
    history_of_illness: string[]

    @ApiProperty({description: "vital signs observed"})
    @IsArray()
    @ArrayNotEmpty()
    vital_signs: string[]

    @ApiPropertyOptional({description: "medical allergies of patient"})
    @IsArray()
    @IsOptional()
    medical_allergies: string[]

    @ApiPropertyOptional({description: "habits of patient"})
    @IsArray()
    @IsOptional()
    habits: string[]

}

