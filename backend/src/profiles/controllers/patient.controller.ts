import { Controller, Get } from '@nestjs/common';
import {PatientService} from '../services/patient.service'

@Controller('patient')
export class PatientController {
    constructor(private patientService: PatientService) {}

    @Get()
    async getPatientProfiles() {
        return await this.patientService.getPatientProfiles()
    }
}
