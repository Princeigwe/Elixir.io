import { IsString, IsNotEmpty, IsNumber } from "class-validator";


export class CreateDailyRoomTokenDto {
    @IsNotEmpty()
    @IsString()
    roomName: string

    @IsNotEmpty()
    @IsNumber()
    roomExp: number
}