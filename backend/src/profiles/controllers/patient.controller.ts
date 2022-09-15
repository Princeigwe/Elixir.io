import { Controller, Get, Param, Patch, Body, Delete, UseGuards } from '@nestjs/common';
import {PatientService} from '../services/patient.service'
import {EditPatientDto} from '../dtos/edit.patient.dto'
import {JwtAuthGuard} from '../../auth/guards/jwt-auth.guard'
import {ApiOperation, ApiParam, ApiTags} from '@nestjs/swagger'


@ApiTags('Patients')
@Controller('patients')
export class PatientController {
    constructor(private patientService: PatientService) {}

    @ApiOperation({description: "Get a patient by ObjectId"})
    @ApiParam({
        name: '_id',
        required: false,
        description: "GET patient by ObjectId"
    })
    @Get(':_id')
    async getPatientProfileById(@Param('_id') _id: string) {
        return await this.patientService.getPatientProfileById(_id)
    }

    @ApiOperation({description: "Get array of patients"})
    @Get()
    async getPatientProfiles() {
        return await this.patientService.getPatientProfiles()
    }

    @ApiOperation({description: "Edit any of the patient attributes. Reference: EditPatientDto"})
    @ApiParam({ 
        name: '_id',
        required: true,
    })
    @Patch(':_id')
    async editBasicPatientProfileById(@Param('_id') _id: string, @Body() body: EditPatientDto) {
        return await this.patientService.editBasicPatientProfileById(_id, body)
    }


    // todo: add admin authorization for this action
    @ApiOperation({description: "DELETE all patients in the database"})
    @Delete()
    async deletePatientsProfiles() {
        return await this.patientService.deletePatientsProfiles()
    }
}
