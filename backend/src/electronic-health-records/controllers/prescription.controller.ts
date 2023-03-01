import { Controller, Post, Body, Param, Request, UseGuards, Get } from '@nestjs/common';
import { PrescriptionService } from '../services/prescription.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PrescriptionDto } from '../dtos/prescription.dto';
import { Roles } from '../../roles.decorator';
import {Role} from '../../enums/role.enum'
import {RolesGuard} from '../../roles.guard'

@Controller('prescriptions')
export class PrescriptionController {

    constructor(
        private prescriptionService: PrescriptionService
    ) {}

    // * ENDPOINTS MEANT FOR MEDICAL PROVIDERS AND ADMIN

    @UseGuards(JwtAuthGuard)
    @Post(':medical_record_id')
    async addPrescriptionToMedicalRecord( @Param('medical_record_id') medical_record_id: string, @Body() body: PrescriptionDto, @Request() request ) {
        const user = request.user
        return await this.prescriptionService.addPrescriptionToMedicalRecord( medical_record_id, user, body.medications, body.instructions)
    }

    @UseGuards(JwtAuthGuard)
    @Get(':prescription_id/')
    async getPrescriptionByID( @Param('prescription_id') prescription_id: string, @Request() request ) {
        const user = request.user
        return await this.prescriptionService.getPrescriptionByID(prescription_id, user)
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Get()
    @Roles(Role.Admin)
    async getPrescriptions() {
        return await this.prescriptionService.getPrescriptions()
    }




    // * ENDPOINTS MEANT FOR THE PATIENT

    // @UseGuards(JwtAuthGuard)
    // @Get('/auth-patient/')
    // async getPrescriptionsOfLoggedInPatient( @Request() request ) {
    //     const user = request.user
    //     return await this.prescriptionService.getPrescriptionsOfLoggedInPatient(user)
    // }
}
