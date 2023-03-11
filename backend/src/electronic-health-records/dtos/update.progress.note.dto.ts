import { IsOptional, IsString, IsNotEmpty } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";


export class UpdateProgressNoteDto {

    @ApiPropertyOptional({description: "document the patient's symptoms, complaints, and any information the patient provides about their health status"})
    @IsString()
    @IsOptional()
    subjectiveInformation: string

    @ApiPropertyOptional({description: "document the results of any physical examination, laboratory tests, or diagnostic imaging studies"})
    @IsString()
    @IsOptional()
    objectiveInformation: string

    @ApiPropertyOptional({description: "the healthcare provider's interpretation of the patient's subjective and objective information, which includes a diagnosis or differential diagnosis"})
    @IsString()
    @IsOptional()
    assessment: string

    @ApiPropertyOptional({description: "outlines the treatment plan, including medications, procedures, therapies, or referrals to other healthcare providers"})
    @IsString()
    @IsOptional()
    plan: string

    @ApiPropertyOptional({description: "documents the patient's progress, any changes to their condition, and any new issues that arise during the course of treatment"})
    @IsString()
    @IsOptional()
    progress: string

}