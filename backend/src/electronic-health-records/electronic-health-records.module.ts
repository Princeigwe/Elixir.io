import { Module } from '@nestjs/common';
import { MedicalRecordService } from './services/medical-record.service';
import { MedicalRecordController } from './controllers/medical-record.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { MedicalRecord, MedicalRecordSchema } from './schemas/medical.record.schema';
import { ProfilesModule } from '../profiles/profiles.module';
import { UsersModule } from '../users/users.module';
import {CaslModule} from '../casl/casl.module'
import { MedicalDepartmentsModule } from '../medical-departments/medical-departments.module';
import { Prescription, PrescriptionSchema } from './schemas/prescription.schema';
import { PrescriptionService } from './services/prescription.service';
import { PrescriptionController } from './controllers/prescription.controller';
import { ProgressNote, ProgressNoteSchema } from './schemas/progress.note.schema';
import { ProgressNoteService } from './services/progress-note.service';
import { ProgressNoteController } from './controllers/progress-note.controller';


@Module({
  imports:[
    MongooseModule.forFeature([
      {name: MedicalRecord.name, schema: MedicalRecordSchema},
      {name: Prescription.name, schema: PrescriptionSchema},
      {name: ProgressNote.name, schema: ProgressNoteSchema}
    ]),
    ProfilesModule,
    UsersModule,
    CaslModule,
    MedicalDepartmentsModule,
  ],
  providers: [MedicalRecordService, PrescriptionService, ProgressNoteService],
  controllers: [MedicalRecordController, PrescriptionController, ProgressNoteController],
  exports: [MedicalRecordService, PrescriptionService],

})
export class ElectronicHealthRecordsModule {}
