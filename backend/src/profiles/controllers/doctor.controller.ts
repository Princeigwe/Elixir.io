import { Controller, Get, Param, Delete, Patch, Body, UseGuards, Query, HttpException, HttpStatus, Request, Post, UseInterceptors, UploadedFile} from '@nestjs/common';
import {DoctorService} from '../services/doctor.service'
import {EditDoctorDto} from '../dtos/edit.doctor.dto'
import {AssignDoctorToDepartmentDto} from '../dtos/assign.doctor.department.dto'
import {Role} from '../../enums/role.enum'
import {Roles} from '../../roles.decorator'
import {JwtAuthGuard} from '../../auth/guards/jwt-auth.guard'
import {RolesGuard} from '../../roles.guard'
import {ApiOperation, ApiParam, ApiQuery, ApiTags, ApiResponse, ApiConsumes, ApiBody} from '@nestjs/swagger'
import {MedicalDepartments} from '../../enums/medical.department.enum'
import {DoctorHierarchy} from '../../enums/doctor.hierarchy.enum'

import {FileInterceptor} from '@nestjs/platform-express'
import { UploadAvatarDto } from '../dtos/upload.avatar.dto';
import {PromoteDemoteDoctorHierarchyDto} from '../dtos/promote-demote-doctor-hierarchy.dto'
import {DeleteDoctorDto} from '../dtos/delete-doctor.dto'


@ApiTags('Doctors')
@Controller('doctors')
export class DoctorController {
    constructor(private doctorService: DoctorService) {}

    @ApiOperation({description: 'GET all doctors or query my first and last names. JWT authentication required'})
    @ApiQuery({
        name: 'firstName',
        required: false,
        description: 'Query doctors by first name'
    })
    @ApiQuery({
        name: 'lastName',
        required: false,
        description: 'Query doctors by last  name'
    })
    @ApiResponse({
        status: 404,
        description: 'Doctors Not Found'
    })
    @ApiResponse({
        status: 200,
        description: 'Returns doctor objects'
    })
    @UseGuards(JwtAuthGuard)
    @Get()
    async getDoctorProfiles(@Query('firstName') firstName?: string, @Query('lastName') lastName?: string) { // to pass test
        if(firstName || lastName || firstName && lastName) { 
            return await this.doctorService.searchDoctorsByFirstAndLastNames(firstName, lastName)
        }
        return await this.doctorService.getDoctorProfiles()
    }

    @UseGuards(JwtAuthGuard)
    @Get('my-profile')
    async getDoctorProfileByEmail(@Request() request) {
        const user = request.user
        return await this.doctorService.getDoctorProfileByEmail(user.email)
    }


    @ApiOperation({description: 'GET doctor by ObjectId. JWT authentication required'})
    @ApiParam({
        name: '_id',
        required: true,
    })
    @ApiResponse({
        status: 200,
        description: 'Returns doctor object'
    })
    @ApiResponse({
        status: 404,
        description: 'Doctor not found'
    })
    @UseGuards(JwtAuthGuard)
    @Get(':_id')
    async getDoctorProfileById(@Param('_id') _id: string) {
        return await this.doctorService.getDoctorProfileById(_id)
    }


    @ApiOperation({description: 'Uploads doctor profile avatar. JWT authentication required. Reference: UploadAvatarDto'})
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
    async uploadDoctorProfileAvatar(@UploadedFile() file: Express.Multer.File, @Param('_id') _id: string, @Request() request) {
        const user = request.user
        if( !file.originalname.match(/\.(jpg|png|jpeg)$/) ) {
            throw new HttpException("File must be of mimetype jpeg/jpg or png", HttpStatus.BAD_REQUEST)
        }
        else if (file.size > 5000000){
            throw new HttpException("File size must not be more than 5MB", HttpStatus.BAD_REQUEST)
        }
        return await this.doctorService.uploadDoctorProfileAvatar(_id, file.buffer, file.originalname, user)
    }


    @ApiOperation({description: 'Edits doctor profile avatar. JWT authentication required. Reference: UploadDoctorAvatarDto'})
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
    async editDoctorProfileAvatar(@UploadedFile() file: Express.Multer.File, @Param('_id') _id: string, @Request() request) {
        const user = request.user
        if( !file.originalname.match(/\.(jpg|png|jpeg)$/) ) {
            throw new HttpException("File must be of mimetype jpeg/jpg or png", HttpStatus.BAD_REQUEST)
        }
        else if (file.size > 5000000){
            throw new HttpException("File size must not be more than 5MB", HttpStatus.BAD_REQUEST)
        }
        return await this.doctorService.editDoctorProfileAvatar(_id, file.buffer, file.originalname, user)
    }

    // @ApiOperation({description: "Edit any of the doctor attributes. JWT authentication required. Reference: EditDoctorDto"})
    // @ApiParam({ 
    //     name: '_id',
    //     required: true,
    // })
    // @UseGuards(JwtAuthGuard)
    // @Patch(':_id')
    // async editBasicDoctorProfileById(@Param('_id') _id: string, @Body() body: EditDoctorDto, @Request() request) {
    //     const user = request.user
    //     return await this.doctorService.editBasicDoctorProfileById(_id, body, user)
    // }


    @ApiOperation({description: "Edit any of the doctor attributes. JWT authentication required. Reference: EditDoctorDto"})
    @UseGuards(JwtAuthGuard)
    @Patch('edit-my-profile')
    async editBasicDoctorProfileOfLoggedInUser(@Body() body: EditDoctorDto, @Request() request) {
        const user = request.user
        return await this.doctorService.editBasicDoctorProfileOfLoggedInUser(body, user)
    }


    @ApiOperation({description: "DELETE all doctors in the database by an admin. JWT authentication required"})
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Delete()
    @Roles(Role.Admin) 
    async deleteDoctorsProfiles() {
        await this.doctorService.deleteDoctorsProfiles()
        // return {message: 'Doctor profiles deleted'}
        throw new HttpException('Doctor Profiles Deleted', HttpStatus.NO_CONTENT) 

    }

    @ApiOperation({description: "DELETE a doctor profile by names, department, and hierarchy, by an admin. JWT authentication required. Reference DeleteDoctorDto"})
    @ApiBody({type: DeleteDoctorDto})
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Delete('/by-detail')
    @Roles(Role.Admin)
    async deleteDoctorByNamesEmailDepartmentAndHierarchy(@Body() body: DeleteDoctorDto) {

        await this.doctorService.deleteDoctorByNamesEmailDepartmentAndHierarchy(body.firstName, body.lastName, body.email, body.department, body.hierarchy);
        throw new HttpException("Doctor Profile Deleted", HttpStatus.NO_CONTENT) 
    }



    @ApiResponse({
        status: 200,
        description: "Returns the doctor's profile with update hierarchy"
    })
    @ApiResponse({
        status: 404,
        description: "Doctor not found"
    })
    @ApiResponse({
        status: 400,
        description: "Consultant hierarchy cannot be promoted any further"
    })
    @ApiOperation({description: "UPDATES doctor profile hierarchy by an admin. JWT authentication required. Reference: PromoteDemoteDoctorHierarchyDto"})
    @ApiBody({type: PromoteDemoteDoctorHierarchyDto})
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Patch('promote-doctor-hierarchy')
    @Roles(Role.Admin) 
    async promoteDoctorHierarchy(@Body() body: PromoteDemoteDoctorHierarchyDto) 
    {
        return this.doctorService.promoteDoctorHierarchy(body.firstName, body.lastName, body.email, body.department)
    }


    @ApiResponse({
        status: 200,
        description: "Returns the doctor's profile with update hierarchy"
    })
    @ApiResponse({
        status: 404,
        description: "Doctor not found"
    })
    @ApiResponse({
        status: 400,
        description: "Medical Student hierarchy cannot be demoted any further"
    })
    @ApiOperation({description: "UPDATES doctor profile hierarchy by an admin. JWT authentication required. Reference: PromoteDemoteDoctorHierarchyDto"})
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Patch('demote-doctor-hierarchy')
    @Roles(Role.Admin) 
    async demoteDoctorHierarchy(@Body() body: PromoteDemoteDoctorHierarchyDto) {
        return this.doctorService.demoteDoctorHierarchy(body.firstName, body.lastName, body.email, body.department)
    }

}
