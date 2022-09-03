import { Controller, Get, Param, Delete, Patch, Body, UseGuards } from '@nestjs/common';
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
    @Get(':_id')
    async getDoctorProfileById(@Param('_id') _id: string) {
        return await this.doctorService.getDoctorProfileById(_id)
    }

    @UseGuards(JwtAuthGuard)
    @Get()
    async getDoctorProfiles() {
        return await this.doctorService.getDoctorProfiles()
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':_id')
    async editBasicDoctorProfileById(@Param('_id') _id: string, @Body() body: EditDoctorDto) {
        return await this.doctorService.editBasicDoctorProfileById(_id, body)
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.Admin)
    @Patch('assign-doctor-to-department/:_id')
    async assignDoctorToDepartment(@Param('_id') _id: string, @Body() body: AssignDoctorToDepartmentDto) {
        return await this.doctorService.assignDoctorToADepartment(_id, body)
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Delete()
    @Roles(Role.Admin)
    async deleteDoctorsProfiles() {
        await this.doctorService.deleteDoctorsProfiles()
        return {message: 'Doctor profiles deleted'}
    }

}
