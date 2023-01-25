import { Module } from '@nestjs/common';
import { MedicalRecordService } from './services/medical-record.service';
import { MedicalRecordController } from './controllers/medical-record.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { MedicalRecord, MedicalRecordSchema } from './schemas/medical.record.schema';
import { ProfilesModule } from '../profiles/profiles.module';
import { UsersModule } from '../users/users.module';
import {CaslModule} from '../casl/casl.module'
import { MedicalDepartmentsModule } from '../medical-departments/medical-departments.module';


@Module({
  imports:[
    MongooseModule.forFeature([
      {name: MedicalRecord.name, schema: MedicalRecordSchema}
    ]),
    ProfilesModule,
    UsersModule,
    CaslModule,
    MedicalDepartmentsModule,
  ],
  providers: [MedicalRecordService],
  controllers: [MedicalRecordController]
})
export class ElectronicHealthRecordsModule {}
