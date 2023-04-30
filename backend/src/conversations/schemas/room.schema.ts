import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type RoomDocument = Room & Document

@Schema()
export class Room {
    @Prop()
    name: string;

    @Prop()
    patientEmail: string;

    @Prop()
    medicalProviderEmail: string;
}

export const RoomSchema = SchemaFactory.createForClass(Room)