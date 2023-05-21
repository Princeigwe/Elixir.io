import { HttpException, HttpStatus, Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Appointment, AppointmentDocument } from './appointment.schema';
import { User } from '../users/users.schema';
import { PatientService } from '../profiles/services/patient.service';
import { DoctorService } from '../profiles/services/doctor.service';
import {AppointmentType} from '../enums/appointment.type.enum'
import { VonageSMS } from './vonage/appointment.sms';
import {UserCategory} from '../enums/user.category.enum'
import {AppointmentStatus} from '../enums/appointment.status.enum'
import {Role} from '../enums/role.enum'
import {StreamCallService} from '../stream-call/stream-call.service'
import { EmailSender } from '../email/transporter';
import * as AesEncryption from 'aes-encryption'


const emailSender = new EmailSender()

const aes = new AesEncryption()
aes.setSecretKey(process.env.ENCRYPTION_KEY || '11122233344455566677788822244455555555555555555231231321313aaaff')





const vonageSMS = new VonageSMS()
@Injectable()
export class AppointmentsService {
    constructor(
        @InjectModel(Appointment.name) private appointmentModel: Model<AppointmentDocument>,
        private patientService: PatientService,
        private doctorService: DoctorService,
        private streamCallService: StreamCallService
    ) {}


    // this will be done by the patient, to schedule appointment with their assigned medical provider
    async scheduleAppointment(user: User, date: Date, duration: string, description?: string, type?: AppointmentType) {
        const patientProfile = await this.patientService.getPatientProfileByEmail(user)
        const currentTimeInSeconds = new Date().getTime() / 1000
        const givenDate = new Date(date);
        const timestampInSeconds = givenDate.getTime() / 1000

        if(!patientProfile) {
            throw new HttpException('This user is not registered as a patient', HttpStatus.NOT_FOUND)
        }
        else if(!patientProfile.telephone) {
            throw new HttpException('To schedule appointment with medical provider, please provide your telephone number in your profile', HttpStatus.BAD_REQUEST)
        }
        else if(!patientProfile.assignedDoctor.name) {
            throw new HttpException('Patient is not assigned to a medical provider', HttpStatus.BAD_REQUEST)
        }

        else if(timestampInSeconds < currentTimeInSeconds) {
            throw new HttpException('Please select an appropriate time for your appointment', HttpStatus.BAD_REQUEST)
        }

        const assignedDoctorProfile = await this.doctorService.getDoctorProfileByEmail(patientProfile.assignedDoctor.email)
        const appointment = await this.appointmentModel.create({ 
            patient: {
                firstName: aes.encrypt(patientProfile.firstName), 
                lastName:  aes.encrypt(patientProfile.lastName),
                email:     aes.encrypt(patientProfile.email)
            },
            doctor: {
                name:  aes.encrypt(patientProfile.assignedDoctor.name),
                email: aes.encrypt(patientProfile.assignedDoctor.email)
            },
            date: date,
            duration: duration,
            description: description == undefined ? null : aes.encrypt(description), 
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
        const currentTimeInSeconds = new Date().getTime() / 1000
        const givenDate = new Date(date);
        const timestampInSeconds = givenDate.getTime() / 1000

        if(!patientProfile) {
            throw new HttpException('Patient profile with this email address does not exist.', HttpStatus.NOT_FOUND)
        }

        else if(!appointment) {
            throw new HttpException('The queried appointment does not exist.', HttpStatus.NOT_FOUND)
        }

        else if(appointment.status == AppointmentStatus.Confirmed) {
            throw new HttpException('This appointment cannot be rescheduled further. If the set time is not fit for you, please schedule another.', HttpStatus.BAD_REQUEST)
        }

        else if(appointment.isValid == false) {
            throw new HttpException('This appointment is now invalid.', HttpStatus.BAD_REQUEST)
        }

        else if(timestampInSeconds < currentTimeInSeconds) {
            throw new HttpException('Please select an appropriate time for your appointment', HttpStatus.BAD_REQUEST)
        }

        await this.appointmentModel.updateOne({_id: appointment_id}, {date: date, status: AppointmentStatus.Rescheduled})
        const patientName = `${patientProfile.firstName} ${patientProfile.lastName}`

        // send sms notification to the patient assigned doctor, notifying them of the rescheduled appointment
        await vonageSMS.sendRescheduleMessageByPatient(patientProfile.assignedDoctor.telephone, patientName, date)
        
        return {message: "Appointment with your doctor has successfully been rescheduled."}
    }


    async rescheduleAppointmentByMedicalProvider(appointment_id: string, user: User, date: Date) {
        const assignedDoctorProfile = await this.doctorService.getDoctorProfileByEmail(user.email)
        const appointment = await this.appointmentModel.findById(appointment_id).exec()
        const decryptedPatientEmail = aes.decrypt(appointment.patient.email)
        const patient = await this.patientService.getPatientByEmailForAppointment(decryptedPatientEmail)
        const currentTimeInSeconds = new Date().getTime() / 1000
        const givenDate = new Date(date);
        const timestampInSeconds = givenDate.getTime() / 1000

        if(!assignedDoctorProfile) {
            throw new HttpException('Medical provider profile with this email address does not exist.', HttpStatus.NOT_FOUND)
        }

        else if(!appointment) {
            throw new HttpException('The queried appointment does not exist.', HttpStatus.NOT_FOUND)
        }

        else if(appointment.status == AppointmentStatus.Confirmed) {
            throw new HttpException('This appointment cannot be rescheduled further. If the set time is not fit for you, please schedule another.', HttpStatus.BAD_REQUEST)
        }

        else if(appointment.isValid == false) {
            throw new HttpException('This appointment is now invalid.', HttpStatus.BAD_REQUEST)
        }

        else if(timestampInSeconds < currentTimeInSeconds) {
            throw new HttpException('Please select an appropriate time for your appointment', HttpStatus.BAD_REQUEST)
        }

        await this.appointmentModel.updateOne({_id: appointment_id}, {date: date, status: AppointmentStatus.Rescheduled})

        const doctorName = `${assignedDoctorProfile.firstName} ${assignedDoctorProfile.lastName}`
        
        // send sms notification to the patient, notifying them of the rescheduled appointment
        await vonageSMS.sendRescheduleMessageByMedicalProvider(patient.telephone, doctorName, date)

        return {message: "Appointment with your patient has successfully been rescheduled."}
    }


    // this will be done by the medical provider, to confirm appointment that has been scheduled by the patient
    async confirmAppointmentByMedicalProvider(appointment_id: string, user: User) {
        const assignedDoctorProfile = await this.doctorService.getDoctorProfileByEmail(user.email)
        const appointment = await this.appointmentModel.findById(appointment_id).exec()
        const decryptedPatientEmail = aes.decrypt(appointment.patient.email)
        const patient = await this.patientService.getPatientByEmailForAppointment(decryptedPatientEmail)

        if(!assignedDoctorProfile) {
            throw new HttpException('Medical provider profile with this email address does not exist.', HttpStatus.NOT_FOUND)
        }

        else if(!appointment) {
            throw new HttpException('The queried appointment does not exist.', HttpStatus.NOT_FOUND)
        }

        else if(appointment.status == AppointmentStatus.Confirmed) {
            throw new HttpException('This appointment is already confirmed.', HttpStatus.OK)
        }

        else if(appointment.isValid == false) {
            throw new HttpException('This appointment is now invalid.', HttpStatus.BAD_REQUEST)
        }

        await this.appointmentModel.updateOne({_id: appointment_id}, {status: AppointmentStatus.Confirmed})
        const doctorName = `${assignedDoctorProfile.firstName} ${assignedDoctorProfile.lastName}`
        
        var updatedAppointment = await this.appointmentModel.findById(appointment_id)

        // send sms notification to the patient, notifying them of the confirmed appointment
        await vonageSMS.sendAppointmentConfirmationMessageByMedicalProvider(patient.telephone, doctorName, updatedAppointment.date)

        if(updatedAppointment.type == AppointmentType.Virtual) {
            await this.createStreamCallSessionAndNotifyPartiesInvolved(appointment.patient.email, user.email, appointment._id)
        }

        const decryptedDetails = {
            patient: {
                firstName: aes.decrypt(updatedAppointment.patient.firstName), 
                lastName:  aes.decrypt(updatedAppointment.patient.lastName),
                email:     aes.decrypt(updatedAppointment.patient.email)
            },
            doctor: {
                name:  aes.decrypt(updatedAppointment.doctor.name),
                email: aes.decrypt(updatedAppointment.doctor.email)
            },

            description: updatedAppointment.description == undefined ? null : aes.decrypt(updatedAppointment.description), 

        }

        updatedAppointment.patient = decryptedDetails.patient
        updatedAppointment.doctor = decryptedDetails.doctor
        updatedAppointment.description = decryptedDetails.description

        return updatedAppointment
    }


    async confirmAppointmentByPatient(appointment_id: string, user: User) {
        const patientProfile = await this.patientService.getPatientByEmailForAppointment(user.email)
        const appointment = await this.appointmentModel.findById(appointment_id).exec()
        const assignedDoctor = await this.doctorService.getDoctorProfileByEmail(appointment.doctor.email)

        if(!patientProfile) {
            throw new HttpException('Patient profile with this email address does not exist.', HttpStatus.NOT_FOUND)
        }

        else if(!appointment) {
            throw new HttpException('The queried appointment does not exist.', HttpStatus.NOT_FOUND)
        }

        else if(appointment.status == AppointmentStatus.Confirmed) {
            throw new HttpException('This appointment is already confirmed.', HttpStatus.OK)
        }

        else if(appointment.isValid == false) {
            throw new HttpException('This appointment is now invalid.', HttpStatus.BAD_REQUEST)
        }

        await this.appointmentModel.updateOne({_id: appointment_id}, {status: AppointmentStatus.Confirmed})
        const patientName = `${patientProfile.firstName} ${patientProfile.lastName}`

        const updatedAppointment = await this.appointmentModel.findById(appointment_id)

        // send sms notification to the doctor, notifying them of the confirmed appointment
        await vonageSMS.sendAppointmentConfirmationMessageByPatient(assignedDoctor.telephone, patientName, updatedAppointment.date)

        if(updatedAppointment.type == AppointmentType.Virtual) {
            await this.createStreamCallSessionAndNotifyPartiesInvolved(user.email, appointment.doctor.email, appointment._id)
        }

        return updatedAppointment
    }


    async createStreamCallSessionAndNotifyPartiesInvolved(patientEmail: string, doctorEmail: string, appointment_id: string) {
        const patient = await this.patientService.getPatientByEmailForAppointment(patientEmail)
        const doctorName = `${patient.assignedDoctor.name}`
        const patientName = `${patient.firstName} ${patient.lastName}`

        // create a stream call session
        const session = await this.streamCallService.createSession(patientEmail, doctorEmail, appointment_id)

        // create a token for the doctor of the stream call session
        const doctorToken = await this.streamCallService.generateToken(session.sessionID)

        // create a token for the patient of the stream call session
        const patientToken = await this.streamCallService.generateToken(session.sessionID)

        // patient stream call data
        const patientSessionData = {
            from: process.env.ELASTIC_EMAIL_FROM_EMAIL,
            to: [patientEmail,],
            subject: `Stream Call with ${doctorName}`,
            html: `Dear ${patient.firstName} ${patient.lastName},
            This <a href="http://localhost:3000/api/v1/stream-call/${process.env.VONAGE_VIDEO_API_KEY}/${session.sessionID}/${patientToken}">link</a> grants you access to a stream call, where important matters can be discussed privately with your doctor. 
            To ensure the confidentiality and integrity of conversation, please refrain from sharing this link with any other individuals.`
        }

        // doctor stream call data
        const doctorSessionData = {
            from: process.env.ELASTIC_EMAIL_FROM_EMAIL,
            to: [patient.assignedDoctor.email,],
            subject: `Stream Call with ${patientName}`,
            html: `Dear ${doctorName},
            This <a href="http://localhost:3000/api/v1/stream-call/${process.env.VONAGE_VIDEO_API_KEY}/${session.sessionID}/${doctorToken}">link</a> grants you access to a stream call, where important matters can be discussed privately with your patient. 
            To ensure the confidentiality and integrity of conversation, please refrain from sharing this link with any other individuals.`
        }

        await emailSender.sendMail(patientSessionData)
        await emailSender.sendMail(doctorSessionData)
    }

    // this will be done by the patient, to cancel appointment that has been scheduled
    async cancelAppointmentByPatient(appointment_id: string, user: User) {
        const patientProfile = await this.patientService.getPatientProfileByEmail(user)
        const appointment = await this.appointmentModel.findById(appointment_id).exec()

        if(!patientProfile) {
            throw new HttpException('Patient profile with this email address does not exist.', HttpStatus.NOT_FOUND)
        }

        else if(!appointment) {
            throw new HttpException('The queried appointment does not exist.', HttpStatus.NOT_FOUND)
        }

        await this.appointmentModel.updateOne({_id: appointment_id}, {status: AppointmentStatus.Canceled, isValid: false})
        const patientName = `${patientProfile.firstName} ${patientProfile.lastName}`

        const updatedAppointment = await this.appointmentModel.findById(appointment_id)

        // send sms notification to the patient assigned doctor, notifying them of the cancelled appointment
        await vonageSMS.sendCancellationMessageByPatient(patientProfile.assignedDoctor.telephone, patientName, updatedAppointment.date)
        return updatedAppointment
    }


    async cancelAppointmentByMedicalProvider(appointment_id: string, user: User) {
        const assignedDoctorProfile = await this.doctorService.getDoctorProfileByEmail(user.email)
        const appointment = await this.appointmentModel.findById(appointment_id).exec()
        const patient = await this.patientService.getPatientByEmailForAppointment(appointment.patient.email)

        if(!assignedDoctorProfile) {
            throw new HttpException('Medical provider profile with this email address does not exist.', HttpStatus.NOT_FOUND)
        }

        else if(!appointment) {
            throw new HttpException('The queried appointment does not exist.', HttpStatus.NOT_FOUND)
        }

        await this.appointmentModel.updateOne({_id: appointment_id}, {status: AppointmentStatus.Canceled, isValid: false})
        const doctorName = `${assignedDoctorProfile.firstName} ${assignedDoctorProfile.lastName}`
        
        const updatedAppointment = await this.appointmentModel.findById(appointment_id)

        // send sms notification to the patient, notifying them of the cancelled appointment
        await vonageSMS.sendCancellationMessageByMedicalProvider(patient.telephone, doctorName, updatedAppointment.date)
        return updatedAppointment
    }


    // by both patient and medical provider, and admin
    async getAppointments(user: User) {
        if(user.role == Role.Admin) {
            const appointments = await this.appointmentModel.find().exec()
            return appointments
        }
        else {

            // get appointments of user regardless of being patient or medical provider
            const myAppointments = await this.appointmentModel.find({ $or: [ { 'doctor.email': user.email }, { 'patient.email': user.email } ] }).exec()
            return myAppointments
        }
    }

    // by both patient and medical provider
    async getAppointmentById(appointment_id: string, user: User) {
        if(user.role == Role.Admin) {
            const appointment = await this.appointmentModel.findById(appointment_id).exec()
            if(!appointment) {
                throw new HttpException("This appointment does not exist", HttpStatus.NOT_FOUND)
            }
            return appointment
        }
        else{
            const myAppointment = await this.appointmentModel.find({ $or: [ { 'doctor.email': user.email, '_id': appointment_id }, { 'patient.email': user.email, '_id': appointment_id } ] }).exec()
            if(!myAppointment) {
                throw new HttpException("This appointment does not exist", HttpStatus.NOT_FOUND)
            }
            return myAppointment
        }
    }


    // async getAppointmentForStreamCallTokenGeneration(appointment_id: string) {
    //     const appointment = await this.appointmentModel.findById(appointment_id).exec()
    //         if(!appointment) {
    //             throw new HttpException("This appointment does not exist", HttpStatus.NOT_FOUND)
    //         }
    //         return appointment
    // }

    // by admin
    async clearAppointments() {
        await this.appointmentModel.deleteMany()
        throw new HttpException( "Records Deleted", HttpStatus.NO_CONTENT)
    }
}
