import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";
import {Document} from 'mongoose'

export type MedicalDepartmentDocument = MedicalDepartment & Document;

@Schema()
export class MedicalDepartment {

    @Prop()
    name: string

    @Prop([])
    groups: [
        // {
        //     consultant: string,
        //     associateSpecialist: string[]
        //     juniorStudent: string[]
        //     medicalStudents: string[]
        // }
    ]

    @Prop([String])
    members: string[]

}

export const MedicalDepartmentSchema = SchemaFactory.createForClass(MedicalDepartment)