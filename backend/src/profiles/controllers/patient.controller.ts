import { Controller, Get, Param } from '@nestjs/common';
import {PatientService} from '../services/patient.service'

@Controller('patients')
export class PatientController {
    constructor(private patientService: PatientService) {}

    @Get(':_id')
    async getPatientProfileById(@Param('_id') _id: any) {
        return await this.patientService.getPatientProfileById(_id)
    }

    @Get()
    async getPatientProfiles() {
        return await this.patientService.getPatientProfiles()
    }
}
