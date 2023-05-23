import { Controller, Body, Post, Request, UseGuards, Param, Patch, Get, Delete } from '@nestjs/common';
import { ScheduleAppointmentDto } from './dtos/schedule.appointment.dto';
import { RescheduleAppointmentDto } from './dtos/reschedule.appointment.dto';
import { AppointmentsService } from './appointments.service';
import {Roles} from '../roles.decorator'
import {Role} from '../enums/role.enum'
import { RolesGuard } from '../roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';


@ApiTags('Appointments')
@Controller('appointments')
export class AppointmentsController {
    constructor( private appointmentsService: AppointmentsService) {}


    @ApiOperation({description: "Gets all the appointments related to the user. Returns all if admin"})
    @ApiResponse({status: 200, description: "This returns the appointments of logged in user"})
    @UseGuards(JwtAuthGuard)
    @Get()
    async getAppointments(@Request() request) {
        const user = request.user
        return await this.appointmentsService.getAppointments(user)
    }


    @UseGuards(JwtAuthGuard)
    @Get('/:appointment_id')
    async getAppointmentById(@Request() request, @Param('appointment_id') appointment_id: string) {
        const user = request.user
        return await this.appointmentsService.getAppointmentById(appointment_id, user)
    }


    @UseGuards(JwtAuthGuard)
    @Post('schedule-appointment')
    async scheduleAppointment(@Request() request, @Body() body: ScheduleAppointmentDto) {
        const user = request.user
        return await this.appointmentsService.scheduleAppointment(user, body.date, body.duration, body.description, body.type)
    }


    @UseGuards(JwtAuthGuard)
    @Patch('reschedule-appointment-by-patient/:appointment_id')
    async rescheduleAppointmentByPatient(@Request() request, @Param('appointment_id') appointment_id: string, @Body() body: RescheduleAppointmentDto) {
        const user = request.user
        return await this.appointmentsService.rescheduleAppointmentByPatient(appointment_id, user, body.date)
    }


    @UseGuards(JwtAuthGuard)
    @Patch('reschedule-appointment-by-medical-provider/:appointment_id')
    async rescheduleAppointmentByMedicalProvider(@Request() request, @Param('appointment_id') appointment_id: string, @Body() body: RescheduleAppointmentDto) {
        const user = request.user
        return await this.appointmentsService.rescheduleAppointmentByMedicalProvider(appointment_id, user, body.date)
    }


    @UseGuards(JwtAuthGuard)
    @Patch('confirm-appointment-by-medical-provider/:appointment_id')
    async confirmAppointmentByMedicalProvider(@Request() request, @Param('appointment_id') appointment_id: string) {
        const user = request.user
        return await this.appointmentsService.confirmAppointmentByMedicalProvider(appointment_id, user)
    }


    @UseGuards(JwtAuthGuard)
    @Patch('confirm-appointment-by-patient/:appointment_id')
    async confirmAppointmentByPatient(@Request() request, @Param('appointment_id') appointment_id: string) {
        const user = request.user
        return await this.appointmentsService.confirmAppointmentByPatient(appointment_id, user)
    }


    @UseGuards(JwtAuthGuard)
    @Patch('cancel-appointment-by-patient/:appointment_id')
    async cancelAppointmentByPatient(@Request() request, @Param('appointment_id') appointment_id: string) {
        const user = request.user
        return await this.appointmentsService.cancelAppointmentByPatient(appointment_id, user)
    }


    @UseGuards(JwtAuthGuard)
    @Patch('cancel-appointment-by-medical-provider/:appointment_id')
    async cancelAppointmentByMedicalProvider(@Request() request, @Param('appointment_id') appointment_id: string) {
        const user = request.user
        return await this.appointmentsService.cancelAppointmentByMedicalProvider(appointment_id, user)
    }


    @UseGuards(JwtAuthGuard, RolesGuard)
    @Delete()
    @Roles(Role.Admin)
    async clearAppointments() {
        return await this.appointmentsService.clearAppointments()
    }
}
