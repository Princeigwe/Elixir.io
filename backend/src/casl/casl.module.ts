import { Module, forwardRef } from '@nestjs/common';
import {CaslAbilityFactory} from './casl-ability.factory'
import {MongooseModule} from '@nestjs/mongoose'
import {Patient, PatientSchema} from '../profiles/schemas/patient.schema'
import {Doctor, DoctorSchema} from '../profiles/schemas/doctor.schema'

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Patient.name, schema: PatientSchema },
            { name: Doctor.name, schema: DoctorSchema }
        ])
    ],
    providers: [CaslAbilityFactory],
    exports: [CaslAbilityFactory]
})
export class CaslModule {}
