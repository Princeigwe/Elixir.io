import { Prop, Schema, SchemaFactory, raw } from "@nestjs/mongoose";
import { Date, Document } from "mongoose";
import * as mongoose from 'mongoose'
import { MedicalRecord } from "./medical.record.schema";
import { RouteOfAdministration } from "../../enums/route.of.administration.enum";

export type PrescriptionDocument = Prescription & Document
// export type MedicationDocument = Medication & Document


// @Schema()
export class Medication {
    name: string
    dosage: string
    routeOfAdministration: RouteOfAdministration
    frequency: string
    duration: string
}


@Schema({timestamps: true})
export class Prescription {

    @Prop({type: mongoose.Schema.Types.ObjectId, ref: 'MedicalRecord'})
    medicalRecord: MedicalRecord

    @Prop(raw({
        firstName: {type: String},
        lastName:  {type: String},
        email:     {type: String},
        age:       {type: Number},
        address:   {type: String},
        telephone: {type: String},
        
    }))
    patient_demographics: Record<string, any>

    @Prop(raw({
        doctor_firstName: {type: String},
        doctor_lastName:  {type: String},
        doctor_department:{type: String},
        doctor_email: {type: String},
        doctor_telephone: {type: String}
    }))
    prescriber: string

    @Prop([Medication])
    medications: Medication[]

    @Prop()
    instructions: string

}

export const PrescriptionSchema = SchemaFactory.createForClass(Prescription)