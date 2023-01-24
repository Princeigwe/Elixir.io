import { Module } from '@nestjs/common';
import { MedicalRecordService } from './services/medical-record.service';
import { MedicalRecordController } from './controllers/medical-record.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { MedicalRecord, MedicalRecordSchema } from './schemas/medical.record.schema';
import { ProfilesModule } from '../profiles/profiles.module';
import { UsersModule } from '../users/users.module';
import {CaslModule} from '../casl/casl.module'


@Module({
  imports:[
    MongooseModule.forFeature([
      {name: MedicalRecord.name, schema: MedicalRecordSchema}
    ]),
    ProfilesModule,
    UsersModule,
    CaslModule,
  ],
  providers: [MedicalRecordService],
  controllers: [MedicalRecordController]
})
export class ElectronicHealthRecordsModule {}
