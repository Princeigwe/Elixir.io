import { Controller, Body, Post, Request, UseGuards, Param, Patch } from '@nestjs/common';
import { ScheduleAppointmentDto } from './dtos/schedule.appointment.dto';
import { RescheduleAppointmentDto } from './dtos/reschedule.appointment.dto';
import { AppointmentsService } from './appointments.service';
import {Roles} from '../roles.decorator'
import {Role} from '../enums/role.enum'
import { RolesGuard } from '../roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';


@Controller('appointments')
export class AppointmentsController {
    constructor( private appointmentsService: AppointmentsService) {}

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
}
