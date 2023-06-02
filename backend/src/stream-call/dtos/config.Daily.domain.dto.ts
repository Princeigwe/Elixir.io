import { IsOptional, IsBoolean } from "class-validator";

export class ConfigDailyDomainDto {

    @IsOptional()
    @IsBoolean()
    enable_advanced_chat: boolean

    @IsOptional()
    @IsBoolean()
    enable_people_ui: boolean
}