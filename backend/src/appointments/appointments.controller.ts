import { Controller, Body, Post, Request, UseGuards, Param, Patch, Get, Delete, CacheInterceptor, UseInterceptors } from '@nestjs/common';
import { ScheduleAppointmentDto } from './dtos/schedule.appointment.dto';
import { RescheduleAppointmentDto } from './dtos/reschedule.appointment.dto';
import { AppointmentsService } from './appointments.service';
import {Roles} from '../roles.decorator'
import {Role} from '../enums/role.enum'
import { RolesGuard } from '../roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';


@ApiTags('Appointments')
@Controller('appointments')
export class AppointmentsController {
    constructor( private appointmentsService: AppointmentsService) {}


    @ApiOperation({description: "Gets all the appointments related to the user. Returns all if admin"})
    @ApiResponse({status: 200, description: "This returns the appointments of logged in user"})
    @ApiResponse({status: 400, description: "If no appointment is found"})
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(CacheInterceptor)
    @Get()
    async getAppointments(@Request() request) {
        const user = request.user
        return await this.appointmentsService.getAppointments(user)
    }


    @ApiOperation({description: "Gets a single appointment by its ID"})
    @ApiParam({name: 'appointment_id', required: false, description: "the id of the appointment"})
    @ApiResponse({status: 200, description: "This returns the appointment"})
    @ApiResponse({status: 400, description: "If appointment is found"})
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(CacheInterceptor)
    @Get('/:appointment_id')
    async getAppointmentById(@Request() request, @Param('appointment_id') appointment_id: string) {
        const user = request.user
        return await this.appointmentsService.getAppointmentById(appointment_id, user)
    }


    @ApiOperation({description: "Schedule an appointment by the logged in patient. Reference to ScheduleAppointmentDto"})
    @ApiBody({type: ScheduleAppointmentDto})
    @UseGuards(JwtAuthGuard)
    @Post('schedule-appointment')
    async scheduleAppointment(@Request() request, @Body() body: ScheduleAppointmentDto) {
        const user = request.user
        return await this.appointmentsService.scheduleAppointment(user, body.date, body.duration, body.description, body.type)
    }


    @ApiOperation({description: "Endpoint to reschedule appointment by the patient. Reference to RescheduleAppointmentDto"})
    @ApiParam({name: 'appointment_id', required: true, description: "the id of the appointment"})
    @ApiBody({type: RescheduleAppointmentDto})
    @ApiResponse({status: 200, description: "Appointment with your doctor has successfully been rescheduled."})
    @UseGuards(JwtAuthGuard)
    @Patch('reschedule-appointment-by-patient/:appointment_id')
    async rescheduleAppointmentByPatient(@Request() request, @Param('appointment_id') appointment_id: string, @Body() body: RescheduleAppointmentDto) {
        const user = request.user
        return await this.appointmentsService.rescheduleAppointmentByPatient(appointment_id, user, body.date)
    }


    @ApiOperation({description: "Endpoint to reschedule appointment by the medical provider. Reference to RescheduleAppointmentDto"})
    @ApiParam({name: 'appointment_id', required: true, description: "the id of the appointment"})
    @ApiBody({type: RescheduleAppointmentDto})
    @ApiResponse({status: 200, description: "Appointment with your patient has successfully been rescheduled."})
    @UseGuards(JwtAuthGuard)
    @Patch('reschedule-appointment-by-medical-provider/:appointment_id')
    async rescheduleAppointmentByMedicalProvider(@Request() request, @Param('appointment_id') appointment_id: string, @Body() body: RescheduleAppointmentDto) {
        const user = request.user
        return await this.appointmentsService.rescheduleAppointmentByMedicalProvider(appointment_id, user, body.date)
    }


    @ApiOperation({description: "Endpoint to confirm appointment by the medical provider."})
    @ApiParam({name: 'appointment_id', required: true, description: "the id of the appointment"})
    @ApiResponse({status: 200, description: "Returns the appointment data."})
    @ApiResponse({status:400, description: "If the appointment has already been confirmed"})
    @UseGuards(JwtAuthGuard)
    @Patch('confirm-appointment-by-medical-provider/:appointment_id')
    async confirmAppointmentByMedicalProvider(@Request() request, @Param('appointment_id') appointment_id: string) {
        const user = request.user
        return await this.appointmentsService.confirmAppointmentByMedicalProvider(appointment_id, user)
    }


    @ApiOperation({description: "Endpoint to confirm appointment by the patient."})
    @ApiParam({name: 'appointment_id', required: true, description: "the id of the appointment"})
    @ApiResponse({status: 200, description: "Returns the appointment data."})
    @ApiResponse({status:400, description: "If the appointment has already been confirmed"})
    @UseGuards(JwtAuthGuard)
    @Patch('confirm-appointment-by-patient/:appointment_id')
    async confirmAppointmentByPatient(@Request() request, @Param('appointment_id') appointment_id: string) {
        const user = request.user
        return await this.appointmentsService.confirmAppointmentByPatient(appointment_id, user)
    }


    @ApiOperation({description: "Endpoint to cancel appointment by the patient."})
    @ApiParam({name: 'appointment_id', required: true, description: "the id of the appointment"})
    @ApiResponse({status: 200, description: "Returns the appointment data."})
    @ApiResponse({status:400, description: "If the appointment has already been canceled"})
    @UseGuards(JwtAuthGuard)
    @Patch('cancel-appointment-by-patient/:appointment_id')
    async cancelAppointmentByPatient(@Request() request, @Param('appointment_id') appointment_id: string) {
        const user = request.user
        return await this.appointmentsService.cancelAppointmentByPatient(appointment_id, user)
    }


    @ApiOperation({description: "Endpoint to cancel appointment by the medical provider."})
    @ApiParam({name: 'appointment_id', required: true, description: "the id of the appointment"})
    @ApiResponse({status: 200, description: "Returns the appointment data."})
    @ApiResponse({status:400, description: "If the appointment has already been canceled"})
    @UseGuards(JwtAuthGuard)
    @Patch('cancel-appointment-by-medical-provider/:appointment_id')
    async cancelAppointmentByMedicalProvider(@Request() request, @Param('appointment_id') appointment_id: string) {
        const user = request.user
        return await this.appointmentsService.cancelAppointmentByMedicalProvider(appointment_id, user)
    }


    @ApiOperation({description: "Endpoint to delete appointments only by the admin."})
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiResponse({status:204})
    @Delete()
    @Roles(Role.Admin)
    async clearAppointments() {
        return await this.appointmentsService.clearAppointments()
    }
}
