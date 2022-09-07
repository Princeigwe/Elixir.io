import { Controller, Get, Param, Patch, Body, Delete, UseGuards } from '@nestjs/common';
import {PatientService} from '../services/patient.service'
import {EditPatientDto} from '../dtos/edit.patient.dto'
import {JwtAuthGuard} from '../../auth/guards/jwt-auth.guard'


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
        return await this.patientService.deletePatientsProfiles()
    }
}
