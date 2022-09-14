import { Module } from '@nestjs/common';
import { MedicalDepartmentsService } from './medical-departments.service';
import { MedicalDepartmentsController } from './medical-departments.controller';
import { MedicalDepartment, MedicalDepartmentSchema } from './medical-departments.schema';
import {MongooseModule} from '@nestjs/mongoose'
import {ProfilesModule} from '../profiles/profiles.module'

@Module({
  imports: [
    MongooseModule.forFeature([
      {name: MedicalDepartment.name, schema: MedicalDepartmentSchema},
    ]),
    ProfilesModule,
  ],
  providers: [MedicalDepartmentsService],
  exports: [MedicalDepartmentsService],
  controllers: [MedicalDepartmentsController]
})
export class MedicalDepartmentsModule {}
