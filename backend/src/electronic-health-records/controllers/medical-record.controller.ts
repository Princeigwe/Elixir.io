import { Controller, Post, Body } from '@nestjs/common';
import { MedicalRecordService } from '../services/medical-record.service';
import { MedicalRecordDto } from '../dtos/medical.record.dto';

@Controller('medical-record')
export class MedicalRecordController {
    constructor( private medicalRecordService: MedicalRecordService ) {}

    @Post()
    async createMedicalRecord( @Body() body: MedicalRecordDto ) {
        return await this.medicalRecordService.createMedicalRecord(
            body.firstName,
            body.lastName,
            body.email,
            body.age,
            body.address,
            body.telephone,
            body.complaints,
            body.history_of_illness,
            body.vital_signs,
            body.medical_allergies,
            body.habits
        )
    }
}
