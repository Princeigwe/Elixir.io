import { Module } from '@nestjs/common';
import {Patient, PatientSchema} from './schemas/patient.schema'
import {MongooseModule} from '@nestjs/mongoose'
import { PatientService } from './services/patient.service';
import { PatientController } from './controllers/patient.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Patient.name, schema: PatientSchema},
    ])
  ],
  providers: [PatientService],
  controllers: [PatientController],
  exports: [PatientService]
})
export class ProfilesModule {}
