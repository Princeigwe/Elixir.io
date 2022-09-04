import { Module } from '@nestjs/common';
import { MedicalDepartmentsService } from './medical-departments.service';
import { MedicalDepartmentsController } from './medical-departments.controller';
import { MedicalDepartment, MedicalDepartmentSchema } from './medical-departments.schema';
import {MongooseModule} from '@nestjs/mongoose'

@Module({
  imports: [
    MongooseModule.forFeature([
      {name: MedicalDepartment.name, schema: MedicalDepartmentSchema},
    ])
  ],
  providers: [MedicalDepartmentsService],
  controllers: [MedicalDepartmentsController]
})
export class MedicalDepartmentsModule {}
