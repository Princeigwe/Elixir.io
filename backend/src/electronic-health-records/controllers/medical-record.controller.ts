import { Controller, Post, Body, Param, UseGuards, Request, Get } from '@nestjs/common';
import { MedicalRecordService } from '../services/medical-record.service';
import { MedicalRecordDto } from '../dtos/medical.record.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Roles } from '../../roles.decorator';
import {Role} from '../../enums/role.enum'
import {RolesGuard} from '../../roles.guard'

@Controller('medical-record')
export class MedicalRecordController {
    constructor( private medicalRecordService: MedicalRecordService ) {}

    @UseGuards(JwtAuthGuard)
    @Post(':patient_id/')
    async createMedicalRecord( @Body() body: MedicalRecordDto, @Param('patient_id') patient_id: string, @Request() request ) {
        const user = request.user

        return await this.medicalRecordService.createMedicalRecord(
            patient_id,
            body.complaints,
            body.history_of_illness,
            body.vital_signs,
            body.medical_allergies,
            body.habits,
            user
        )
    }


    @UseGuards(JwtAuthGuard, RolesGuard)
    @Get()
    @Roles(Role.Admin) 
    async getMedicalRecords() {
        return await this.medicalRecordService.getMedicalRecords()
    }
}
