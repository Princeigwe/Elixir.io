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
    @ApiResponse({status:403, description: "Forbidden action, as you are not responsible for this patient"})
    @ApiResponse({status: 200, description: "Return an updated medical record with some encrypted properties"})
    @UseGuards(JwtAuthGuard)
    @Patch(':medical_record_id/')
    async updateMedicalRecordByID( @Param('medical_record_id') medical_record_id: string, @Request() request, @Body() body: UpdateMedicalRecordDto ) {
        const user = request.user
        return await this.medicalRecordService.updateMedicalRecordByID(medical_record_id, user, body.complaints, body.history_of_illness, body.vital_signs, body.medical_allergies, body.habits)
    }


    @UseGuards(JwtAuthGuard, RolesGuard)
    @Get()
    @Roles(Role.Admin) 
    async getMedicalRecords() {
        return await this.medicalRecordService.getMedicalRecords()
    }

    // this route is used by the logged in patient to get owned medical records
    @UseGuards(JwtAuthGuard)
    @Get('auth-patient/')
    async getLoggedInPatientRecord(@Request() request) {
        const user = request.user
        return await this.medicalRecordService.getLoggedInPatientRecord(user)
    }


    // this route is used by the logged in admin to read a medical record
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Get(':medical_record_id/')
    @Roles(Role.Admin)
    async getMedicalRecordByID( @Param('medical_record_id') medical_record_id: string) {
        return await this.medicalRecordService.getMedicalRecordByID(medical_record_id)
    }


    @UseGuards(JwtAuthGuard)
    @Get('read-access/:medical_record_id/')
    async readActionOfMedicalRecordByMedicalProvider(@Request() request, @Param('medical_record_id') medical_record_id: string) {
        const user = request.user
        return await this.medicalRecordService.readActionOfMedicalRecordByMedicalProvider(medical_record_id, user)
    }


    @UseGuards(JwtAuthGuard)
    @Post('grant-read-access/:medical_record_id')
    async grantReadAccessOfMedicalRecordToMedicalProvider(@Request() request, @Param('medical_record_id') medical_record_id: string, @Body() body: ReadAccessDto ) {
        const user =  request.user
        return await this.medicalRecordService.grantReadAccessOfMedicalRecordToMedicalProvider(user, medical_record_id, body.email)
    }


    @UseGuards(JwtAuthGuard)
    @Post('revoke-read-access/:medical_record_id')
    async revokeReadAccessOfMedicalRecordFromMedicalProvider( @Request() request, @Param('medical_record_id') medical_record_id: string, @Body() body: ReadAccessDto ) {
        const user =  request.user
        return await this.medicalRecordService.revokeReadAccessOfMedicalRecordFromMedicalProvider(user, medical_record_id, body.email)
    }


    @UseGuards(JwtAuthGuard, RolesGuard)
    @Delete()
    @Roles(Role.Admin)
    async deleteMedicalRecords( ) {
        return await this.medicalRecordService.deleteMedicalRecords()
    }


    @UseGuards(JwtAuthGuard, RolesGuard)
    @Delete('/:medical_record_id')
    @Roles(Role.Admin)
    async deleteMedicalRecord( @Param('medical_record_id') medical_record_id: string ) {
        return await this.medicalRecordService.deleteMedicalRecord(medical_record_id)
    }
}
