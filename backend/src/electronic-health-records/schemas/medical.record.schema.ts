import { Prop, Schema, SchemaFactory, raw } from "@nestjs/mongoose";
import { Date, Document } from "mongoose";
import { ExcludeProperty } from 'nestjs-mongoose-exclude'
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

export type MedicalRecordDocument = MedicalRecord & Document

@Schema()
export class MedicalRecord {

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
        complaints:         {type: Array},
        history_of_illness: {type: Array},
        vital_signs:        {type: Array},
        medical_allergies:  {type: Array},
        habits:             {type: Array}
    }))
    treatment_history: Record<string, any>

    // @Prop(raw({
    //     physical_and_mental_observations:  {type: String},
    //     bladder_and_bowel_functions:       {type: String},
    //     food_intake:                       {type: String}
    // }))
    // progress_notes: [ Record<string, any> ]

    // @Prop(raw({
    //     prescription:      {type: String},
    //     dose:              {type: String},
    //     method_of_intake:  {type: String}
    // }))
    // medications: [ Record<string, any> ]

    @Prop(raw({
        doctor_firstName: {type: String},
        doctor_lastName:  {type: String},
        doctor_department:{type: String},
    }))
    issued_by: string

    @Prop(raw({
        doctor_firstName: {type: String},
        doctor_lastName:  {type: String},
        doctor_department:{type: String},
    }))
    updated_by: string

    @Prop({type: Date, default: Date.now})
    created_at: Date

    @Prop({type:Date, default: Date.now})
    updatedAt: Date

    // this column is used to hold emails of those that have read access to the medical record
    @ExcludeProperty()
    @Prop([String])
    recipients: string[]
}


export const MedicalRecordSchema = SchemaFactory.createForClass(MedicalRecord)

MedicalRecordSchema.plugin(updateIfCurrentPlugin);
