import {Prop, Schema, SchemaFactory, raw} from '@nestjs/mongoose'
import { Document } from 'mongoose'
import {MaritalStatus} from '../../enums/marital.status.enum'
import * as mongoose from 'mongoose'
import {User} from '../../users/users.schema'
import {DoctorHierarchy} from '../../enums/doctor.hierarchy.enum'
import {MedicalDepartments} from '../../enums/medical.department.enum'


export type DoctorDocument = Doctor & Document

@Schema()
export class Doctor {

    // todo: this will be the url string of profile image
    // @Prop()
    // imageUrl: string

    @Prop({type: mongoose.Schema.Types.ObjectId, ref: 'User'})
    user: User

    @Prop()
    firstName: string

    @Prop()
    lastName: string

    @Prop()
    age: number

    @Prop()
    address: string

    @Prop()
    telephone: string

    @Prop({default: MaritalStatus.Single})
    maritalStatus: MaritalStatus

    @Prop([String])
    specialties: string[]

    @Prop([String])
    certificates: string[]

    @Prop({default: DoctorHierarchy.AssociateSpecialist})
    hierarchy: DoctorHierarchy

    @Prop()
    yearsOfExperience: number

    @Prop([String])
    languages: string[]

    @Prop()
    department: MedicalDepartments 


    @Prop([])
    assignedPatients: [
        // {
        //     imageUrl: string,
        //     firstName: string,
        //     lastName: string,
        //     age: number,
        //     address: string,
        //     telephone: string,
        //     occupation: string,
        //     maritalStatus: string,
        //     medicalIssues: string[],
        //     prescriptions: [],
        //     pharmacyTelephone: string
        // }
    ]

}

export const DoctorSchema = SchemaFactory.createForClass(Doctor)
