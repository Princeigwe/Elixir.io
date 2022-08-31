import { Controller, Get, Param, Patch, Body, Delete } from '@nestjs/common';
import {PatientService} from '../services/patient.service'
import {EditPatientDto} from '../dtos/edit.pateint.dto'

@Controller('patients')
export class PatientController {
    constructor(private patientService: PatientService) {}

    @Get(':_id')
    async getPatientProfileById(@Param('_id') _id: string) {
        return await this.patientService.getPatientProfileById(_id)
    }

    @Get()
    async getPatientProfiles() {
        return await this.patientService.getPatientProfiles()
    }

    @Patch(':_id')
    async editBasicPatientProfileById(@Param('_id') _id: string, @Body() body: EditPatientDto) {
        return await this.patientService.editBasicPatientProfileById(_id, body)
    }

    @Delete()
    async deletePatientsProfiles() {
        await this.patientService.deletePatientsProfiles()
        return {message: 'Patients profiles deleted'}
    }
}
