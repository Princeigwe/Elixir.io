import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";
import {Document} from 'mongoose'
import { Appointment } from "../appointments/appointment.schema";
import * as mongoose from 'mongoose'


export type SessionDocument = Session & Document

@Schema()
export class Session {
    @Prop()
    patientEmail: string;

    @Prop()
    doctorEmail: string;

    @Prop({type: mongoose.Schema.Types.ObjectId, ref: 'Appointment'})
    appointment: Appointment
}

export const SessionSchema = SchemaFactory.createForClass(Session)