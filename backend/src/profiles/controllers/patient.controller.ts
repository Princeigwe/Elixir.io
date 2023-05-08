import { Controller, Get, Param, Patch, Body, Post, Delete, UseGuards, Request, UseInterceptors, UploadedFile, HttpException, HttpStatus } from '@nestjs/common';
import {PatientService} from '../services/patient.service'
import {EditPatientDto} from '../dtos/edit.patient.dto'
import {JwtAuthGuard} from '../../auth/guards/jwt-auth.guard'
import {ApiOperation, ApiParam, ApiTags, ApiResponse, ApiConsumes, ApiBody} from '@nestjs/swagger'

import {Role} from '../../enums/role.enum'
import {Roles} from '../../roles.decorator'
import {RolesGuard} from '../../roles.guard'
import {FileInterceptor} from '@nestjs/platform-express'
import { UploadAvatarDto } from '../dtos/upload.avatar.dto';
import {AssignDoctorToPatientDto} from '../dtos/assign.doctor.toPatient.dto'



@ApiTags('Patients')
@Controller('patients')
export class PatientController {
    constructor(private patientService: PatientService) {}

    @UseGuards(JwtAuthGuard)
    @Get("/my-profile")
    async getPatientProfileOfLoggedInUser(@Request() request) {
        const user = request.user
        return await this.patientService.getPatientProfileByEmail(user)
    }

    @ApiOperation({description: "Get a patient by ObjectId"})
    @ApiParam({
        name: '_id',
        required: false,
        description: "GET patient by ObjectId"
    })
    @Get('/:_id')
    async getPatientProfileById(@Param('_id') _id: string) {
        return await this.patientService.getPatientProfileById(_id)
    }

    @ApiOperation({description: "Get array of patients"})
    @Get()
    async getPatientProfiles() {
        return await this.patientService.getPatientProfiles()
    }


    // @ApiOperation({description: "Edit any of the patient attributes. Reference: EditPatientDto"})
    // @ApiParam({ 
    //     name: '_id',
    //     required: true,
    // })
    // @UseGuards(JwtAuthGuard)
    // @Patch(':_id')
    // async editBasicPatientProfileById(@Param('_id') _id: string, @Body() body: EditPatientDto, @Request() request) {
    //     const user = request.user
    //     return await this.patientService.editBasicPatientProfileById(_id, body, user)
    // }

    @ApiOperation({description: "Edit any of the patient attributes. Reference: EditPatientDto"})
    @UseGuards(JwtAuthGuard)
    @Patch('edit-my-profile')
    async editBasicPatientProfileOfLoggedInUser(@Body() body: EditPatientDto, @Request() request) {
        const user = request.user;
        return await this.patientService.editBasicPatientProfileOfLoggedInUser(body, user)
    }


    @ApiOperation({description: 'Uploads patient profile avatar. JWT authentication required. Reference: UploadAvatarDto'})
    @ApiParam({
        name: '_id',
        required: true,
    })
    @ApiResponse({
        status: 200,
    })
    @ApiConsumes('multipart/form-data')
    @ApiBody({type: UploadAvatarDto})
    @UseGuards(JwtAuthGuard)
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


    @ApiOperation({description: 'Edits patient profile avatar. JWT authentication required. Reference: UploadDoctorAvatarDto'})
    @ApiParam({
        name: '_id',
        required: true,
    })
    @ApiResponse({
        status: 200,
    })
    @ApiConsumes('multipart/form-data')
    @ApiBody({type: UploadAvatarDto})
    @UseGuards(JwtAuthGuard)
    @Patch('avatar/upload/:_id')
    @UseInterceptors(FileInterceptor('file'))
    async editPatientProfileAvatar(@UploadedFile() file: Express.Multer.File, @Param('_id') _id: string, @Request() request) {
        const user = request.user
        if( !file.originalname.match(/\.(jpg|png|jpeg)$/) ) {
            throw new HttpException("File must be of mimetype jpeg/jpg or png", HttpStatus.BAD_REQUEST)
        }
        else if (file.size > 5000000){
            throw new HttpException("File size must not be more than 5MB", HttpStatus.BAD_REQUEST)
        }
        return await this.patientService.editPatientProfileAvatar(_id, file.buffer, file.originalname, user)
    }

    @ApiOperation({description: 'Assigns a doctor to a patient. The doctor carrying out this action must be a consultant. JWT authentication required. Reference: AssignDoctorToPatientDto'})
    @ApiParam({
        name: 'patientId',
        required: true,
    })
    @ApiResponse({
        status: 200,
        description: "Returns the updated patient profile"
    })
    @ApiResponse({
        status: 400,
        description: "Returns a BAD REQUEST if doctor is not a member of the consultant's department"
    })
    @ApiResponse({
        status: 403,
        description: "Forbidden action, as you are not a medical provider"
    })
    @ApiResponse({
        status: 403,
        description: "Forbidden action, as you are not a consultant"
    })
    @ApiBody({type: AssignDoctorToPatientDto})
    @UseGuards(JwtAuthGuard)
    @Patch(':patientId/assign-patient-to-doctor')
    async assignDoctorToPatient(@Param('patientId') patientId: string, @Request() request, @Body() body: AssignDoctorToPatientDto ) {
        const user = request.user
        return await this.patientService.assignDoctorToPatient(user, patientId, body.doctorFirstName, body.doctorLastName)
    }


    @ApiOperation({description: "Removes assigned patient from doctor's care. The doctor carrying out this action must be a consultant. JWT authentication required. Reference: AssignDoctorToPatientDto"})
    @ApiParam({
        name: 'patientId',
        required: true,
    })
    @ApiResponse({
        status: 200,
        description: "Returns the updated patient profile"
    })
    @ApiResponse({
        status: 400,
        description: "Returns a BAD REQUEST if doctor is not a member of the consultant's department"
    })
    @ApiResponse({
        status: 403,
        description: "Forbidden action, as you are not a medical provider"
    })
    @ApiResponse({
        status: 403,
        description: "Forbidden action, as you are not a consultant"
    })
    @ApiBody({type: AssignDoctorToPatientDto})
    @UseGuards(JwtAuthGuard)
    @Patch(':patientId/remove-assigned-patient-from-doctor')
    async removeAssignedPatientFromDoctor( @Param('patientId') patientId: string, @Request() request, @Body() body: AssignDoctorToPatientDto ) {
        const user = request.user
        return await this.patientService.removeAssignedPatientFromDoctor(user, patientId, body.doctorFirstName, body.doctorLastName)
    }

    @ApiOperation({description: "DELETE all patients in the database"})
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Delete()
    @Roles(Role.Admin)
    async deletePatientsProfiles() {
        return await this.patientService.deletePatientsProfiles()
    }
}
