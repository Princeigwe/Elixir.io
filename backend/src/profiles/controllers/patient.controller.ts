import { Controller, Get, Param, Patch, Body, Post, Delete, UseGuards, Request, UseInterceptors, UploadedFile, HttpException, HttpStatus } from '@nestjs/common';
import {PatientService} from '../services/patient.service'
import {EditPatientDto} from '../dtos/edit.patient.dto'
import {JwtAuthGuard} from '../../auth/guards/jwt-auth.guard'
import {ApiOperation, ApiParam, ApiTags} from '@nestjs/swagger'

import {Role} from '../../enums/role.enum'
import {Roles} from '../../roles.decorator'
import {RolesGuard} from '../../roles.guard'
import {FileInterceptor} from '@nestjs/platform-express'



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
    @UseGuards(JwtAuthGuard)
    @Patch(':_id')
    async editBasicPatientProfileById(@Param('_id') _id: string, @Body() body: EditPatientDto, @Request() request) {
        const user = request.user
        return await this.patientService.editBasicPatientProfileById(_id, body, user)
    }


    @Post('avatar/upload/:_id')
    @UseInterceptors(FileInterceptor('file'))
    async uploadPatientProfileAvatar(@UploadedFile() file: Express.Multer.File, @Param('_id') _id: string, @Request() request) {
        const user = request.user
        if( !file.originalname.match(/\.(jpg|png|jpeg)$/) ) {
            throw new HttpException("File must be of mimetype jpeg/jpg or png", HttpStatus.BAD_REQUEST)
        }
        else if (file.size > 5000000){
            throw new HttpException("File size must not be more than 5MB", HttpStatus.BAD_REQUEST)
        }
        return await this.patientService.uploadPatientProfileAvatar(_id, file.buffer, file.originalname, user)
    }


    // todo: add admin authorization for this action
    @ApiOperation({description: "DELETE all patients in the database"})
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Delete()
    @Roles(Role.Admin)
    async deletePatientsProfiles() {
        return await this.patientService.deletePatientsProfiles()
    }
}
