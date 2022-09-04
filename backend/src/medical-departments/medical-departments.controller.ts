import { Controller, UseGuards, Post, Body, Get, Delete } from '@nestjs/common';
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
    
}
