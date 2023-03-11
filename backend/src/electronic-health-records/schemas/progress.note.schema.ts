import { Prop, Schema, SchemaFactory, raw } from "@nestjs/mongoose";
import { Document } from "mongoose";
import * as mongoose from 'mongoose'
import { MedicalRecord } from "./medical.record.schema";


export type ProgressNoteDocument = ProgressNote & Document

@Schema({timestamps: true})
export class ProgressNote {

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


    /* documents the patient's symptoms,
    complaints, and any information the patient provides about their health status 
     */
    @Prop()
    subjectiveInformation: string

    /**
     *  includes the results of any physical
     *  examination, laboratory tests, or diagnostic imaging studies
     */
    @Prop()
    objectiveInformation: string

    /**
     * the healthcare provider's interpretation of the patient's subjective and objective information,
     *  which includes a diagnosis or differential diagnosis
     */
    @Prop()
    assessment: string

    /**
     * outlines the treatment plan, including medications, procedures, 
     * therapies, or referrals to other healthcare providers
     */
    @Prop()
    plan: string

    /**
     * documents the patient's progress, any changes to their condition, 
     * and any new issues that arise during the course of treatment
     */
    @Prop()
    progress: string

    @Prop(raw({
        doctor_firstName: {type: String},
        doctor_lastName:  {type: String},
        doctor_department:{type: String},
        doctor_email: {type: String},
        doctor_telephone: {type: String}
    }))
    issued_by: string

}

export const ProgressNoteSchema = SchemaFactory.createForClass(ProgressNote)