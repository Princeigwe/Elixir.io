import { IsOptional, IsEmail, IsString, IsNotEmpty, IsArray, IsEnum, ValidateNested, ArrayMinSize } from "class-validator"
import { RouteOfAdministration } from "../../enums/route.of.administration.enum";
import { Type } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class MedicationDto {
    
    @ApiProperty({description: "the name of the drug to be prescribed"})
    @IsString()
    @IsNotEmpty()
    name: string

    @ApiProperty({description: "the dosage of the drug to be prescribed"})
    @IsString()
    @IsNotEmpty()
    dosage: string

    @ApiProperty({description: "The route of administration"})
    @IsEnum(RouteOfAdministration)
    @IsNotEmpty()
    routeOfAdministration: RouteOfAdministration

    @ApiProperty({description: "Frequency of intake"})
    @IsString()
    @IsNotEmpty()
    frequency: string

    @ApiProperty({description: "The duration of intake"})
    @IsString()
    @IsNotEmpty()
    duration: string

}



export class PrescriptionDto {

    @ApiProperty({description: "Array of medications. { name: required, dosage: required, routeOfAdministration: required, frequency: required, duration: required }", example: [{ name: 'paracetamol', dosage: 'two tablets', routeOfAdministration: 'Oral', frequency: 'twice daily', duration: '10 days' }]})
    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({each: true})
    @Type(() => MedicationDto)
    medications: MedicationDto[]

    @ApiPropertyOptional({description: "Instruction of prescription"})
    @IsString()
    @IsOptional()
    instructions: string

}