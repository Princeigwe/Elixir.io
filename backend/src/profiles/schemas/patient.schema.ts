import {Prop, Schema, SchemaFactory, raw} from '@nestjs/mongoose'
import {Document} from 'mongoose'
import {MaritalStatus} from '../../enums/marital.status.enum'
import * as mongoose from 'mongoose'
import {User} from '../../users/users.schema'
import {MedicalDepartments} from '../../enums/medical.department.enum'
import {DoctorHierarchy} from '../../enums/doctor.hierarchy.enum'


export type PatientDocument = Patient & Document

@Schema()
export class Patient {
    
    // todo: this will be the url string of profile image
    @Prop()
    imageUrl: string
    
    @Prop({type: mongoose.Schema.Types.ObjectId, ref: 'User'})
    user: User

    @Prop()
    firstName: string

    @Prop()
    lastName: string

    @Prop()
    email: string

    @Prop()
    age: number

    @Prop()
    address: string

    @Prop()
    telephone: string

    @Prop()
    occupation: string

    @Prop({default: MaritalStatus.Single})
    maritalStatus: MaritalStatus

    @Prop([String])
    medicalIssues: string[]

    @Prop({ type: mongoose.Schema.Types.Array })
    prescriptions: [
        // {
        //     drug: string,
        //     dosage: string,
        //     issueDate: Date,
        //     issuerName: string
        //     issuerTelephone: string
        // }
    ]

    // @Prop()
    // doctorName: string

    // @Prop()
    // doctorTelephone: string

    // @Prop()
    // doctorAddress: string

    // @Prop()
    // doctorDepartment: MedicalDepartments

    // @Prop()
    // doctorHierarchy: DoctorHierarchy


    @Prop(raw({
        name:       {type: String},
        telephone:  {type: String},
        email:      {type: String},
        department: {type: String},
    }))
    assignedDoctor: Record<string, any>

    @Prop()
    pharmacyTelephone: string

}

export const PatientSchema = SchemaFactory.createForClass(Patient)