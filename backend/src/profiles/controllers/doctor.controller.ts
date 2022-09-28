import { Controller, Get, Param, Delete, Patch, Body, UseGuards, Query, HttpException, HttpStatus, Request, Post, UseInterceptors, UploadedFile} from '@nestjs/common';
import {DoctorService} from '../services/doctor.service'
import {EditDoctorDto} from '../dtos/edit.doctor.dto'
import {AssignDoctorToDepartmentDto} from '../dtos/assign.doctor.department.dto'
import {Role} from '../../enums/role.enum'
import {Roles} from '../../roles.decorator'
import {JwtAuthGuard} from '../../auth/guards/jwt-auth.guard'
import {RolesGuard} from '../../roles.guard'
import {ApiOperation, ApiParam, ApiQuery, ApiTags, ApiResponse} from '@nestjs/swagger'
import {MedicalDepartments} from '../../enums/medical.department.enum'
import {DoctorHierarchy} from '../../enums/doctor.hierarchy.enum'

import {FileInterceptor} from '@nestjs/platform-express'


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


    @Post('avatar/upload/:email')
    @UseInterceptors(FileInterceptor('file'))
    async uploadDoctorProfileAvatar(@UploadedFile() file: Express.Multer.File, @Param('email') email: string) {
        if( !file.originalname.match(/\.(jpg|png|jpeg)$/) ) {
            throw new HttpException("File must be of mimetype jpeg/jpg or png", HttpStatus.BAD_REQUEST)
        }
        else if (file.size > 5000000){
            throw new HttpException("File size must not be more than 5MB", HttpStatus.BAD_REQUEST)
        }
        return await this.doctorService.uploadDoctorProfileAvatar(email, file.buffer, file.originalname)
    }


    @Patch('avatar/upload/:email')
    @UseInterceptors(FileInterceptor('file'))
    async editDoctorProfileAvatar(@UploadedFile() file: Express.Multer.File, @Param('email') email: string) {
        if( !file.originalname.match(/\.(jpg|png|jpeg)$/) ) {
            throw new HttpException("File must be of mimetype jpeg/jpg or png", HttpStatus.BAD_REQUEST)
        }
        else if (file.size > 5000000){
            throw new HttpException("File size must not be more than 5MB", HttpStatus.BAD_REQUEST)
        }
        return await this.doctorService.editDoctorProfileAvatar(email, file.buffer, file.originalname)
    }

    @ApiOperation({description: "Edit any of the doctor attributes. JWT authentication required. Reference: EditDoctorDto"})
    @ApiParam({ 
        name: '_id',
        required: true,
    })
    @UseGuards(JwtAuthGuard)
    @Patch(':_id')
    async editBasicDoctorProfileById(@Param('_id') _id: string, @Body() body: EditDoctorDto, @Request() request) {
        const user = request.user
        return await this.doctorService.editBasicDoctorProfileById(_id, body, user)
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

    @ApiOperation({description: "DELETE a doctor profile by names, department, and hierarchy, by an admin. JWT authentication required"})
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Delete(':firstName/:lastName/:department/:hierarchy')
    @Roles(Role.Admin)
    async deleteDoctorByNamesDepartmentAndHierarchy(
        @Param('firstName') firstName: string, 
        @Param('lastName') lastName: string, 
        @Param('department') department: MedicalDepartments, 
        @Param('hierarchy') hierarchy: DoctorHierarchy) {

        await this.doctorService.deleteDoctorByNamesDepartmentAndHierarchy(firstName, lastName, department, hierarchy);
        throw new HttpException("Doctor Profile Deleted", HttpStatus.NO_CONTENT) 
    }

}
