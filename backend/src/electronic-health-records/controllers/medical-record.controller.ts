import { Controller, Post, Body, Param, UseGuards, Request, Get, UseInterceptors, ClassSerializerInterceptor } from '@nestjs/common';
import { MedicalRecordService } from '../services/medical-record.service';
import { MedicalRecordDto } from '../dtos/medical.record.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Roles } from '../../roles.decorator';
import {Role} from '../../enums/role.enum'
import {RolesGuard} from '../../roles.guard'
import {SanitizeMongooseModelInterceptor} from 'nestjs-mongoose-exclude'
import { ReadAccessDto } from '../dtos/read.access.dto';

@UseInterceptors(new SanitizeMongooseModelInterceptor({excludeMongooseId: false, excludeMongooseV: false})) // hides recipients of record
@Controller('medical-records')
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

    // this route is used by the logged in patient to get owned medical records
    @UseGuards(JwtAuthGuard)
    @Get('auth-patient/')
    async getLoggedInPatientRecords(@Request() request) {
        const user = request.user
        return await this.medicalRecordService.getLoggedInPatientRecords(user)
    }


    // this route is used by the logged in admin to read a medical record
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Get(':medical_record_id/')
    @Roles(Role.Admin)
    async getMedicalRecordByID( @Param('medical_record_id') medical_record_id: string) {
        return await this.medicalRecordService.getMedicalRecordByID(medical_record_id)
    }


    // this route is used by the logged in patient to read owned medical record
    @UseGuards(JwtAuthGuard)
    @Get('auth-patient/:medical_record_id/')
    async readMedicalRecordOfLoggedInPatientByID(@Request() request, @Param('medical_record_id') medical_record_id: string ) {
        const user = request.user
        return await this.medicalRecordService.readMedicalRecordOfLoggedInPatientByID(medical_record_id, user)
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
}
