import {Prop, Schema, SchemaFactory, raw} from '@nestjs/mongoose'
import {Document} from 'mongoose'
import {AppointmentStatus} from '../enums/appointment.status.enum'
import {AppointmentType} from '../enums/appointment.type.enum'


export type AppointmentDocument = Appointment & Document

@Schema()
export class Appointment {

    @Prop(raw({
        firstName: {type: String},
        lastName:  {type: String},
        email:     {type: String},
    }))
    patient: Record<string, any> 

    @Prop(raw({
        name:  {type: String},
        email: {type: String},
    }))
    doctor: Record<string, any>

    @Prop()
    date: Date

    @Prop({default: AppointmentStatus.Scheduled})
    status: AppointmentStatus

    @Prop()
    description: string

    @Prop({default: AppointmentType.Virtual})
    type: AppointmentType

    @Prop()
    duration: string
}

export const AppointmentSchema = SchemaFactory.createForClass(Appointment)