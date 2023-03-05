import { IsOptional, IsString, IsNotEmpty } from "class-validator";


export class UpdateProgressNoteDto {

    @IsString()
    @IsOptional()
    subjectiveInformation: string

    @IsString()
    @IsOptional()
    objectiveInformation: string

    @IsString()
    @IsOptional()
    assessment: string

    @IsString()
    @IsOptional()
    plan: string

    @IsString()
    @IsOptional()
    progress: string

}