import { Controller, Body, Post, Request, UseGuards } from '@nestjs/common';
import { ScheduleAppointmentDto } from './dtos/schedule.appointment.dto';
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
}
