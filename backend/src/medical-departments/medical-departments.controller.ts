import { Controller, UseGuards, Post, Body, Get, Delete, Param,Query } from '@nestjs/common';
import {MedicalDepartmentsService} from './medical-departments.service'
import {JwtAuthGuard} from '../auth/guards/jwt-auth.guard'
import {RolesGuard} from '../roles.guard'
import {Roles} from '../roles.decorator'
import { Role } from '../enums/role.enum';
import {CreateMedicalDepartmentDto} from './dtos/create.medical.department.dto'


@Controller('medical-departments')
export class MedicalDepartmentsController {
    constructor(private medicalDepartmentsService: MedicalDepartmentsService) {}

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Post()
    @Roles(Role.Admin)
    async createMedicalDepartment(@Body() body: CreateMedicalDepartmentDto) {
        return this.medicalDepartmentsService.createMedicalDepartment(body.name)
    }

    @Get()
    async getMedicalDepartments(@Query('name') name: string) {
        if(name) {
            return this.medicalDepartmentsService.searchMedicalDepartmentByName(name)
        }
        return this.medicalDepartmentsService.getMedicalDepartments()
    }

    // @Get()
    // async searchMedicalDepartmentByName() {}

    // @UseGuards(JwtAuthGuard, RolesGuard)
    // @Delete(':name')
    // @Roles(Role.Admin)
    // async deleteMedicalDepartmentByName(@Param('name') name: string) {
    //     return this.medicalDepartmentsService.deleteMedicalDepartmentByName(name)
    // }
}
