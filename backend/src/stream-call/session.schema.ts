import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";
import {Document} from 'mongoose'

export type SessionDocument = Session & Document

@Schema()
export class Session {

    @Prop()
    sessionID: string;

    @Prop()
    patientEmail: string;

    @Prop()
    doctorEmail: string;
}

export const SessionSchema = SchemaFactory.createForClass(Session)