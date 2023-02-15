import { IsOptional, IsEmail, IsString, IsNotEmpty, IsArray, IsEnum, ValidateNested, ArrayMinSize } from "class-validator"
import { RouteOfAdministration } from "../../enums/route.of.administration.enum";
import { Type } from "class-transformer";


export class MedicationDto {
    
    @IsString()
    @IsNotEmpty()
    name: string

    @IsString()
    @IsNotEmpty()
    dosage: string

    @IsEnum(RouteOfAdministration)
    @IsNotEmpty()
    routeOfAdministration: RouteOfAdministration

    @IsString()
    @IsNotEmpty()
    frequency: string

    @IsString()
    @IsNotEmpty()
    duration: string

}



export class PrescriptionDto {

    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({each: true})
    @Type(() => MedicationDto)
    medications: MedicationDto[]

    @IsString()
    @IsOptional()
    instructions: string

}