import { Controller, Get, Param, Delete, Patch, Body, UseGuards, Query } from '@nestjs/common';
import {DoctorService} from '../services/doctor.service'
import {EditDoctorDto} from '../dtos/edit.doctor.dto'
import {AssignDoctorToDepartmentDto} from '../dtos/assign.doctor.department.dto'
import {Role} from '../../enums/role.enum'
import {Roles} from '../../roles.decorator'
import {JwtAuthGuard} from '../../auth/guards/jwt-auth.guard'
import {RolesGuard} from '../../roles.guard'

@Controller('doctors')
export class DoctorController {
    constructor(private doctorService: DoctorService) {}

    @UseGuards(JwtAuthGuard)
    @Get()
    async getDoctorProfiles(@Query('firstName') firstName?: string, @Query('lastName') lastName?: string) { // to pass test
        if(firstName || lastName || firstName && lastName) { 
            return await this.doctorService.searchDoctorsByFirstAndLastNames(firstName, lastName)
        }
        return await this.doctorService.getDoctorProfiles()
    }

    @UseGuards(JwtAuthGuard)
    @Get(':_id')
    async getDoctorProfileById(@Param('_id') _id: string) {
        return await this.doctorService.getDoctorProfileById(_id)
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':_id')
    async editBasicDoctorProfileById(@Param('_id') _id: string, @Body() body: EditDoctorDto) {
        return await this.doctorService.editBasicDoctorProfileById(_id, body)
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Delete()
    @Roles(Role.Admin)
    async deleteDoctorsProfiles() {
        await this.doctorService.deleteDoctorsProfiles()
        return {message: 'Doctor profiles deleted'}
    }

}
