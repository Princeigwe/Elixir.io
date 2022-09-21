import { Module } from '@nestjs/common';
import {Patient, PatientSchema} from './schemas/patient.schema'
import {Doctor, DoctorSchema} from './schemas/doctor.schema'
import {MongooseModule} from '@nestjs/mongoose'
import { PatientService } from './services/patient.service';
import { PatientController } from './controllers/patient.controller';
import { DoctorService } from './services/doctor.service';
import { DoctorController } from './controllers/doctor.controller';
import {UsersModule} from '../users/users.module'
import {CaslModule} from '../casl/casl.module'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Patient.name, schema: PatientSchema },
      { name: Doctor.name, schema: DoctorSchema }
    ]),
    UsersModule,
    CaslModule
  ],
  providers: [PatientService, DoctorService],
  controllers: [PatientController, DoctorController],
  exports: [PatientService, DoctorService]
})
export class ProfilesModule {}
