import { Controller, UseGuards, Post, Body, Get, Delete, Param,Query } from '@nestjs/common';
import {MedicalDepartmentsService} from './medical-departments.service'
import {JwtAuthGuard} from '../auth/guards/jwt-auth.guard'
import {RolesGuard} from '../roles.guard'
import {Roles} from '../roles.decorator'
import { Role } from '../enums/role.enum';
import {CreateMedicalDepartmentDto} from './dtos/create.medical.department.dto'
import {ApiTags, ApiResponse, ApiOperation, ApiParam, ApiQuery, ApiBody} from '@nestjs/swagger'


@ApiTags('Medical Departments')
@Controller('medical-departments')
export class MedicalDepartmentsController {
    constructor(private medicalDepartmentsService: MedicalDepartmentsService) {}

    @ApiOperation({description: "Creates a new department with one of [ Cardiology, Dermatology, Urology, IntensiveCareMedicine, Neurology, Surgery, Radiology, Pharmacy] as name data, only by an admin. Reference: CreateMedicalDepartmentDto"})
    @ApiResponse({ 
        status: 201,
        description: "Returns the object of a Medical Department."
    })
    @ApiResponse({ 
        status: 401,
        description: "Unauthorized"
    })
    @ApiResponse({ 
        status: 400,
        description: "Medical department already exists, create with a different name"
    })
    @ApiBody({type: CreateMedicalDepartmentDto})
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Post()
    @Roles(Role.Admin)
    async createMedicalDepartment(@Body() body: CreateMedicalDepartmentDto) {
        return this.medicalDepartmentsService.createMedicalDepartment(body.name)
    }

    @ApiOperation({description: "Get medical departments or queries endpoint for one"})
    @ApiQuery({ 
        name: 'name',
        required: false,
        description: "This is the query key to get department by name",
    })
    @Get()
    async getOrSearchMedicalDepartments(@Query('name') name?: string) { // name is optional in order to pass test
        if(name) {
            return this.medicalDepartmentsService.searchMedicalDepartmentByName(name)
        }
        return this.medicalDepartmentsService.getMedicalDepartments()
    }

    @ApiOperation({description: "DELETE departments or one by name query, executed by an admin"})
    @ApiQuery({ 
        name: 'name',
        required: false,
        description: "Deletes a department by name"
    })
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Delete()
    @Roles(Role.Admin)
    async deleteMedicalDepartmentByName(@Query('name') name: string) {
        if (name) { return this.medicalDepartmentsService.searchAndDeleteMedicalDepartmentByName(name) }
        return this.medicalDepartmentsService.deleteMedicalDepartments()
    }
}
