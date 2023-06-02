import { Controller, Post, Body, Param, UseGuards, Request, Get, UseInterceptors, ClassSerializerInterceptor, Patch, Delete } from '@nestjs/common';
import { MedicalRecordService } from '../services/medical-record.service';
import { MedicalRecordDto, UpdateMedicalRecordDto } from '../dtos/medical.record.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Roles } from '../../roles.decorator';
import {Role} from '../../enums/role.enum'
import {RolesGuard} from '../../roles.guard'
import {SanitizeMongooseModelInterceptor} from 'nestjs-mongoose-exclude'
import { ReadAccessDto } from '../dtos/read.access.dto';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Medical Records')
@UseInterceptors(new SanitizeMongooseModelInterceptor({excludeMongooseId: false, excludeMongooseV: false})) // hides recipients of record
@Controller('medical-records')
export class MedicalRecordController {
    constructor( private medicalRecordService: MedicalRecordService ) {}

    @ApiOperation({description: "This endpoint creates a medical record for a patient. This action is only possible for medical provider that is responsible for the patient, or the consultant responsible for the medical provider. Authentication is required. Reference: MedicalRecordDto"})
    @ApiParam({name: 'patient_id', required: true, description: "the patient's id"})
    @ApiBody({type: MedicalRecordDto})
    @ApiResponse({status: 200, description: "Returns a resource with some encrypted properties"})
    @ApiResponse({status: 403, description: "Forbidden action, as you are not responsible for this patient"})
    @ApiResponse({status: 400, description: "An existing record exists for this patient, please make relevant changes to it"})
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


    @ApiOperation({description: "This endpoint updates an existing medical record for a patient. This action is only possible for medical provider that is responsible for the patient, or the consultant responsible for the medical provider. Authentication is required. Reference: UpdateMedicalRecordDto"})
    @ApiParam({name: 'medical_record_id', required: true, description: "the id of the medical record"})
    @ApiBody({type: UpdateMedicalRecordDto})
    @ApiResponse({status:403,  description: "Forbidden action, as you are not responsible for this patient"})
    @ApiResponse({status: 200, description: "Return an updated medical record with some encrypted properties"})
    @UseGuards(JwtAuthGuard)
    @Patch(':medical_record_id/')
    async updateMedicalRecordByID( @Param('medical_record_id') medical_record_id: string, @Request() request, @Body() body: UpdateMedicalRecordDto ) {
        const user = request.user
        return await this.medicalRecordService.updateMedicalRecordByID(medical_record_id, user, body.complaints, body.history_of_illness, body.vital_signs, body.medical_allergies, body.habits)
    }


    @ApiOperation({description: "Gets all the medical records to be viewed by an admin"})
    @ApiResponse({status: 403,  description: "Forbidden Resource"})
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Get()
    @Roles(Role.Admin) 
    async getMedicalRecords() {
        return await this.medicalRecordService.getMedicalRecords()
    }

    // this route is used by the logged in patient to get owned medical records
    @ApiOperation({description: "This endpoint gets medical record of the logged in patient. Authentication is required"})
    @ApiResponse({status: 200, description: "This returns the medical record of a logged in patient"})
    @ApiResponse({status: 400, description: "Record not found"})
    @UseGuards(JwtAuthGuard)
    @Get('auth-patient/')
    async getLoggedInPatientRecord(@Request() request) {
        const user = request.user
        return await this.medicalRecordService.getLoggedInPatientRecord(user)
    }


    // this route is used by the logged in admin to read a medical record
    @ApiOperation({description: "Get a medical record to be viewed by the admin"})
    @ApiParam({name: 'medical_record_id', required: false, description: "the id of the medical record"})
    @ApiResponse({status: 200, description: "This returns the medical record of a patient for the admin"})
    @ApiResponse({status: 403,  description: "Forbidden Resource"})
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Get(':medical_record_id/')
    @Roles(Role.Admin)
    async getMedicalRecordByID( @Param('medical_record_id') medical_record_id: string) {
        return await this.medicalRecordService.getMedicalRecordByID(medical_record_id)
    }


    @ApiOperation({description: "Returns a medical record to the medical provider that is authorized to view it. Authentication required"})
    @ApiParam({name: 'medical_record_id', required: true, description: "the id of the medical record"})
    @ApiResponse({status: 200, description: "This returns the medical record of a patient for the authorized medical provider"})
    @ApiResponse({status: 403,  description: "Forbidden action. Request for access to medical record from patient"})
    @UseGuards(JwtAuthGuard)
    @Get('read-action/:medical_record_id/')
    async readActionOfMedicalRecordByMedicalProvider(@Request() request, @Param('medical_record_id') medical_record_id: string) {
        const user = request.user
        return await this.medicalRecordService.readActionOfMedicalRecordByMedicalProvider(medical_record_id, user)
    }


    @ApiOperation({description: "This endpoint enables the patient give read permission of their medical record to a medical provider that is not assigned to them, by their email"})
    @ApiParam({name: 'medical_record_id', required: true, description: "the id of the medical record"})
    @ApiBody({type: ReadAccessDto})
    @ApiResponse({status: 200, description: "You have successfully granted read access to <medical provider.firstName> <medical provider.lastName>"})
    @ApiResponse({status: 403,  description: "Forbidden action. (If the person trying to give the patient is not a patient)"})
    @UseGuards(JwtAuthGuard)
    @Post('grant-read-access/:medical_record_id')
    async grantReadAccessOfMedicalRecordToMedicalProvider(@Request() request, @Param('medical_record_id') medical_record_id: string, @Body() body: ReadAccessDto ) {
        const user =  request.user
        return await this.medicalRecordService.grantReadAccessOfMedicalRecordToMedicalProvider(user, medical_record_id, body.email)
    }


    @ApiOperation({description: "This endpoint enables the patient revoke read permission of their medical record from a medical provider that is not assigned to them, by their email"})
    @ApiParam({name: 'medical_record_id', required: true, description: "the id of the medical record"})
    @ApiBody({type: ReadAccessDto})
    @ApiResponse({status: 200, description: "You have successfully revoke read access from <medical provider.firstName> <medical provider.lastName>"})
    @ApiResponse({status: 403,  description: "Forbidden action. (If the person trying to give the patient is not a patient)"})
    @UseGuards(JwtAuthGuard)
    @Post('revoke-read-access/:medical_record_id')
    async revokeReadAccessOfMedicalRecordFromMedicalProvider( @Request() request, @Param('medical_record_id') medical_record_id: string, @Body() body: ReadAccessDto ) {
        const user =  request.user
        return await this.medicalRecordService.revokeReadAccessOfMedicalRecordFromMedicalProvider(user, medical_record_id, body.email)
    }


    @ApiOperation({description: "Delete medical records by the admin"})
    @ApiResponse({status: 204})
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Delete()
    @Roles(Role.Admin)
    async deleteMedicalRecords( ) {
        return await this.medicalRecordService.deleteMedicalRecords()
    }


    @ApiOperation({description: "Delete a medical record by the admin"})
    @ApiParam({name: 'medical_record_id', required: false, description: "the id of the medical record"})
    @ApiResponse({status: 204})
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Delete('/:medical_record_id')
    @Roles(Role.Admin)
    async deleteMedicalRecord( @Param('medical_record_id') medical_record_id: string ) {
        return await this.medicalRecordService.deleteMedicalRecord(medical_record_id)
    }
}
