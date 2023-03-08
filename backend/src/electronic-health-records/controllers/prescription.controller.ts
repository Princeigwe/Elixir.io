import { Controller, Post, Body, Param, Request, UseGuards, Get, Query, Delete } from '@nestjs/common';
import { PrescriptionService } from '../services/prescription.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { MedicationDto, PrescriptionDto } from '../dtos/prescription.dto';
import { Roles } from '../../roles.decorator';
import {Role} from '../../enums/role.enum'
import {RolesGuard} from '../../roles.guard'
import { ApiOperation, ApiParam, ApiResponse, ApiTags, ApiBody, ApiQuery } from '@nestjs/swagger';

@ApiTags("Prescriptions")
@Controller('prescriptions')
export class PrescriptionController {

    constructor(
        private prescriptionService: PrescriptionService
    ) {}

    // * ENDPOINTS MEANT FOR MEDICAL PROVIDERS AND ADMIN

    @ApiOperation({description: "Enables the medical provider authorized to medical record add a prescription for the patient"})
    @ApiResponse({status: 200})
    @ApiParam({name: "medical_record_id", required: true, description: "the id of the medical record"})
    @ApiBody({type: PrescriptionDto})
    @UseGuards(JwtAuthGuard)
    @Post(':medical_record_id')
    async addPrescriptionToMedicalRecord( @Param('medical_record_id') medical_record_id: string, @Body() body: PrescriptionDto, @Request() request, medication: MedicationDto ) {
        const user = request.user
        return await this.prescriptionService.addPrescriptionToMedicalRecord( medical_record_id, user, body.medications, body.instructions)
    }

    @ApiOperation({description: "Gets the prescriptions of the authenticated patient"})
    @ApiResponse({status: 404,  description: "Prescriptions not found."})
    @ApiResponse({status: 200,  description: "Returns prescriptions"})
    @UseGuards(JwtAuthGuard)
    @Get('auth-patient/')
    async getPrescriptionsOfLoggedInPatient( @Request() request ) {
        const user = request.user
        return await this.prescriptionService.getPrescriptionsOfLoggedInPatient(user)
    }

    @ApiOperation({description: "Returns a prescription for the admin, the authorized medical provider and its patient"})
    @ApiParam({name: "prescription_id", description: "The id of the prescription"})
    @ApiResponse({status: 200})
    @ApiResponse({status: 403, description: "Forbidden action, as you are not authorized to access resource. If you are a medical provider, request read access to medical record tied to this prescription"})
    @ApiResponse({status: 404, description: "Progress note not found"})
    @UseGuards(JwtAuthGuard)
    @Get('/:prescription_id')
    async getPrescriptionByID( @Param('prescription_id') prescription_id: string, @Request() request ) {
        const user = request.user
        return await this.prescriptionService.getPrescriptionByID(prescription_id, user)
    }

    @ApiOperation({description: "Endpoint that allows administrator to read all medical prescriptions"})
    @ApiQuery({name: "medical_record_id", required: false, description: "query parameter"})
    @ApiResponse({status: 403, description: 'Forbidden Resource'})
    @ApiResponse({status: 200})
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Get()
    @Roles(Role.Admin)
    async getPrescriptions( @Request() request, @Query('medical_record_id') medical_record_id?: string ) {
        const user = request.user
        if(medical_record_id) {
            return await this.prescriptionService.filterPrescriptionsTiedToMedicalRecord(medical_record_id, user)
        }
        else {
            return await this.prescriptionService.getPrescriptions()
        }
    }

    // this endpoint allows a medical provider filter prescriptions of the the patient under their care. It can also be used by the admin
    @ApiOperation({description: "This endpoint allows a medical provider filter prescriptions of the the patient under their care. It can also be used by the admin"})
    @ApiParam({name: "medical_record_id", description: "The id of the medical record"})
    @ApiResponse({status: 403, description: "Unauthorized access to prescriptions. If you are a medical provider, request read access to medical record"})
    @ApiResponse({status: 200})
    @UseGuards(JwtAuthGuard)
    @Get('patient-prescriptions/:medical_record_id')
    async filterPrescriptionsTiedToMedicalRecord( @Param('medical_record_id') medical_record_id: string, @Request() request ) {
        const user = request.user
        return await this.prescriptionService.filterPrescriptionsTiedToMedicalRecord(medical_record_id, user)
    }


    @ApiOperation({description: "This endpoint deletes all prescriptions by the admin"})
    @ApiResponse({status: 203})
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Delete()
    @Roles(Role.Admin)
    async deletePrescriptions( ) {
        return await this.prescriptionService.deletePrescriptions()
    }


    @ApiOperation({description: "This endpoint deletes a prescription by the admin"})
    @ApiParam({name: "prescription_id", description: "The id of the prescription"})
    @ApiResponse({status: 203})
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Delete('/:prescription_id')
    @Roles(Role.Admin)
    async deletePrescription( @Param('prescription_id') prescription_id: string ) {
        return await this.prescriptionService.deletePrescription(prescription_id)
    }
}
