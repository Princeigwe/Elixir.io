import { IsOptional, IsString, IsNotEmpty } from "class-validator";


export class ProgressNoteDto {

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
    @IsNotEmpty()
    progress: string

}