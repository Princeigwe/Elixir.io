import { IsOptional, IsBoolean } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class ConfigDailyDomainDto {

    @ApiPropertyOptional({description: "A boolean property that, when set to true, enables advanced chat features for end users. This includes the ability to use emoji reactions, an emoji picker in the chat input form, and the ability to send a Giphy chat message", example: false})
    @IsOptional()
    @IsBoolean()
    enable_advanced_chat: boolean

    @ApiPropertyOptional({description: "This parameter is a boolean property that, when set to true, enables the People UI feature in the Daily.co video call platform. This feature adds a People button in the call tray that reveals a People tab in the call sidebar", example: true})
    @IsOptional()
    @IsBoolean()
    enable_people_ui: boolean
}