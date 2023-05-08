import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Appointment, AppointmentDocument } from './appointment.schema';
import { User } from '../users/users.schema';
import { PatientService } from '../profiles/services/patient.service';
import { DoctorService } from '../profiles/services/doctor.service';
import {AppointmentType} from '../enums/appointment.type.enum'
import { VonageSMS } from './vonage/appointment.sms';
import {UserCategory} from '../enums/user.category.enum'


const vonageSMS = new VonageSMS()
@Injectable()
export class AppointmentsService {
    constructor(
        @InjectModel(Appointment.name) private appointmentModel: Model<AppointmentDocument>,
        private patientService: PatientService,
        private doctorService: DoctorService,
    ) {}


    // this will be done by the patient, to schedule appointment with their assigned medical provider
    async scheduleAppointment(user: User, date: Date, duration: string, description?: string, type?: AppointmentType) {
        const patientProfile = await this.patientService.getPatientProfileByEmail(user)
        const assignedDoctorProfile = await this.doctorService.getDoctorProfileByEmail(patientProfile.assignedDoctor.email)

        if(!patientProfile) {
            throw new HttpException('This user is not registered as a patient', HttpStatus.NOT_FOUND)
        }
        if(!patientProfile.telephone) {
            throw new HttpException('To schedule appointment with medical provider, please provide your telephone number in your profile', HttpStatus.BAD_REQUEST)
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

        const patientName = `${patientProfile.firstName} ${patientProfile.lastName}`

        // send sms notification to the patient assigned doctor, notifying them of the scheduled appointment
        await vonageSMS.sendScheduleMessage( assignedDoctorProfile.telephone, patientName, appointment.date )

        return appointment.save()
    }

    // this will be done by the medical provider and patient
    async rescheduleAppointmentByPatient(appointment_id: string, user: User, date: Date) {
        const patientProfile = await this.patientService.getPatientProfileByEmail(user)
        const appointment = await this.appointmentModel.findById(appointment_id).exec()

        if(!patientProfile) {
            throw new HttpException('Patient profile with this email address does not exist.', HttpStatus.NOT_FOUND)
        }

        else if(!appointment) {
            throw new HttpException('The queried appointment does not exist.', HttpStatus.NOT_FOUND)
        }

        await this.appointmentModel.updateOne({_id: appointment_id}, {date: date})
        const patientName = `${patientProfile.firstName} ${patientProfile.lastName}`

        // send sms notification to the patient assigned doctor, notifying them of the rescheduled appointment
        await vonageSMS.sendRescheduleMessageByPatient(patientProfile.assignedDoctor.telephone, patientName, date)

        return {message: 'Appointment updated successfully'}
    }


    async rescheduleAppointmentByMedicalProvider(appointment_id: string, user: User, date: Date) {
        const assignedDoctorProfile = await this.doctorService.getDoctorProfileByEmail(user.email)
        const appointment = await this.appointmentModel.findById(appointment_id).exec()
        const patient = await this.patientService.getPatientByEmailForAppointment(appointment.patient.email)

        if(!assignedDoctorProfile) {
            throw new HttpException('Medical provider profile with this email address does not exist.', HttpStatus.NOT_FOUND)
        }

        else if(!appointment) {
            throw new HttpException('The queried appointment does not exist.', HttpStatus.NOT_FOUND)
        }

        await this.appointmentModel.updateOne({_id: appointment_id}, {date: date})

        const doctorName = `${assignedDoctorProfile.firstName} ${assignedDoctorProfile.lastName}`

        // send sms notification to the patient, notifying them of the rescheduled appointment
        await vonageSMS.sendRescheduleMessageByMedicalProvider(patient.telephone, doctorName, date)
        return {message: 'Appointment updated successfully'}
    }

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