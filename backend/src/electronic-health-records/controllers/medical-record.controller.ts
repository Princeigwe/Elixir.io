import { Controller, Post, Body, Param } from '@nestjs/common';
import { MedicalRecordService } from '../services/medical-record.service';
import { MedicalRecordDto } from '../dtos/medical.record.dto';

@Controller('medical-record')
export class MedicalRecordController {
    constructor( private medicalRecordService: MedicalRecordService ) {}

    @Post(':patient_id/')
    async createMedicalRecord( @Body() body: MedicalRecordDto, @Param('patient_id') patient_id: string ) {
        
        return await this.medicalRecordService.createMedicalRecord(
            patient_id,
            body.complaints,
            body.history_of_illness,
            body.vital_signs,
            body.medical_allergies,
            body.habits
        )
    }
}
