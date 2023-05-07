import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Appointment, AppointmentDocument } from './appointment.schema';
import { User } from '../users/users.schema';
import { PatientService } from '../profiles/services/patient.service';
import {AppointmentType} from '../enums/appointment.type.enum'


@Injectable()
export class AppointmentsService {
    constructor(
        @InjectModel(Appointment.name) private appointmentModel: Model<AppointmentDocument>,
        private patientService: PatientService
    ) {}


    // this will be done by the patient, to schedule appointment with their assigned medical provider
    async scheduleAppointment(user: User, date: Date, duration: string, description?: string, type?: AppointmentType) {
        const patientProfile = await this.patientService.getPatientProfileByEmail(user)
        if(!patientProfile) {
            throw new HttpException('This user is not registered as a patient', HttpStatus.NOT_FOUND)
        }
        else if(!patientProfile.assignedDoctor.name) {
            throw new HttpException('Patient is not assigned to a medical provider', HttpStatus.BAD_REQUEST)
        }
        const appointment = await this.appointmentModel.create({ 
            patient: {
                firstName: patientProfile.firstName, 
                lastName:  patientProfile.lastName,
                email:     patientProfile.email
            },
            doctor: {
                name:  patientProfile.assignedDoctor.name,
                email: patientProfile.assignedDoctor.email
            },
            date: date,
            duration: duration,
            description: description, 
            type: type
        })
        return appointment.save()
    }

    // this will be done by the medical provider and patient
    async rescheduleAppointment() {}

    // this will be done by the medical provider, to confirm appointment that has been scheduled by the patient
    async confirmAppointment() {}

    // this will be done by the medical provider and patient, to cancel appointment that has been scheduled by the patient
    async cancelAppointment() {}

    // to change appointment status from cancelled to scheduled by the medical provider
    async reinstateAppointment() {}

    // by both patient and medical provider, and admin
    async getAppointments() {}

    // by both patient and medical provider
    async getScheduledAppointments() {}

    // by admin
    async clearAppointments() {}
}
