import { HttpException, HttpStatus, Injectable, Inject, forwardRef, NotFoundException } from '@nestjs/common';
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


    /**
     * This function schedules an appointment for a patient with their assigned doctor and sends a
     * notification to the doctor via SMS.
     * @param {User} user - The user parameter is an instance of the User class, which likely contains
     * information about the patient scheduling the appointment, such as their name and email address.
     * @param {Date} date - The date for the scheduled appointment.
     * @param {string} duration - The duration parameter is a string that represents the length of the
     * appointment. It could be in minutes or hours, depending on the implementation.
     * @param {string} [description] - An optional string parameter that describes the appointment. If
     * not provided, it will be set to null.
     * @param {AppointmentType} [type] - The type of appointment, which is an optional parameter. If
     * provided, it should be of type AppointmentType.
     * @returns a Promise that resolves to the saved appointment object.
     */
    async scheduleAppointment(user: User, date: Date, duration: string, description?: string, type?: AppointmentType) {
        const patientProfile = await this.patientService.getPatientByEmailForAppointment(user.email)
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
        var appointment = await this.appointmentModel.create({ 
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

        appointment.save()

        const decryptedAppointment = await this.appointmentModel.findById(appointment._id).exec()
        decryptedAppointment.patient.firstName = aes.decrypt(decryptedAppointment.patient.firstName)
        decryptedAppointment.patient.lastName  = aes.decrypt(decryptedAppointment.patient.lastName)
        decryptedAppointment.patient.email     = aes.decrypt(decryptedAppointment.patient.email)

        decryptedAppointment.doctor.name  = aes.decrypt(decryptedAppointment.doctor.name)
        decryptedAppointment.doctor.email = aes.decrypt(decryptedAppointment.doctor.email)
        decryptedAppointment.description  = decryptedAppointment.description == undefined ? null : aes.decrypt(decryptedAppointment.description)

        return decryptedAppointment

    }


    /**
     * This function reschedules an appointment for a patient and sends an SMS notification to the
     * assigned doctor.
     * @param {string} appointment_id - The ID of the appointment that needs to be rescheduled.
     * @param {User} user - The user parameter is an object of type User, which contains information
     * about the patient who is rescheduling the appointment.
     * @param {Date} date - The new date for the appointment to be rescheduled to.
     * @returns An object containing a message indicating that the appointment with the doctor has been
     * successfully rescheduled.
     */
    async rescheduleAppointmentByPatient(appointment_id: string, user: User, date: Date) {
        const patientProfile = await this.patientService.getPatientByEmailForAppointment(user.email)
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


    /**
     * This function reschedules an appointment by a medical provider and sends an SMS notification to
     * the patient.
     * @param {string} appointment_id - The ID of the appointment that needs to be rescheduled.
     * @param {User} user - The `user` parameter is an object of type `User` which contains information
     * about the medical provider who is rescheduling the appointment.
     * @param {Date} date - The date parameter is a Date object representing the new date and time for
     * the appointment to be rescheduled to.
     * @returns An object containing a message indicating that the appointment with the patient has
     * been successfully rescheduled.
     */
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


    /**
     * This function confirms a medical appointment and sends a notification to the patient, while also
     * updating the appointment details.
     * @param {string} appointment_id - The ID of the appointment being confirmed.
     * @param {User} user - The `user` parameter is an object of type `User` which contains information
     * about the medical provider who is confirming the appointment.
     * @returns the updated appointment object with decrypted patient and doctor details.
     */
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
            await this.createStreamCallSessionAndNotifyPartiesInvolved(decryptedPatientEmail, user.email, appointment._id)
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


    /**
    * This function confirms an appointment by a patient, updates the appointment status, sends an SMS
    * notification to the assigned doctor, creates a stream call session if the appointment is virtual,
    * and returns the updated appointment details.
    * @param {string} appointment_id - a string representing the ID of the appointment being confirmed
    * @param {User} user - The `user` parameter is an object of type `User` which contains information
    * about the patient who is confirming the appointment.
    * @returns the updated appointment object with decrypted patient and doctor details and confirmed
    * status.
    */
    async confirmAppointmentByPatient(appointment_id: string, user: User) {
        const patientProfile = await this.patientService.getPatientByEmailForAppointment(user.email)
        const appointment = await this.appointmentModel.findById(appointment_id).exec()
        const decryptedDoctorEmail = aes.decrypt(appointment.doctor.email)
        const assignedDoctor = await this.doctorService.getDoctorProfileByEmail(decryptedDoctorEmail)

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

        var updatedAppointment = await this.appointmentModel.findById(appointment_id)

        // send sms notification to the doctor, notifying them of the confirmed appointment
        await vonageSMS.sendAppointmentConfirmationMessageByPatient(assignedDoctor.telephone, patientName, updatedAppointment.date)

        if(updatedAppointment.type == AppointmentType.Virtual) {
            await this.createStreamCallSessionAndNotifyPartiesInvolved(user.email, decryptedDoctorEmail, appointment._id)
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


    /**
     * This function cancels an appointment for a patient and sends a notification to the assigned
     * doctor.
     * @param {string} appointment_id - The ID of the appointment that the patient wants to cancel.
     * @param {User} user - The `user` parameter is an object of type `User` which represents the
     * patient who is cancelling the appointment. It is used to retrieve the patient's profile
     * information, including their assigned doctor's telephone number.
     * @returns The updated appointment is being returned.
     */
    async cancelAppointmentByPatient(appointment_id: string, user: User) {
        const patientProfile = await this.patientService.getPatientByEmailForAppointment(user.email)
        const appointment = await this.appointmentModel.findById(appointment_id).exec()

        if(!patientProfile) {
            throw new HttpException('Patient profile with this email address does not exist.', HttpStatus.NOT_FOUND)
        }

        else if(!appointment) {
            throw new HttpException('The queried appointment does not exist.', HttpStatus.NOT_FOUND)
        }

        else if(appointment.status == AppointmentStatus.Canceled) {
            throw new HttpException('This appointment is already cancelled.', HttpStatus.BAD_REQUEST)
        }

        await this.appointmentModel.updateOne({_id: appointment_id}, {status: AppointmentStatus.Canceled, isValid: false})
        const patientName = `${patientProfile.firstName} ${patientProfile.lastName}`

        const updatedAppointment = await this.appointmentModel.findById(appointment_id)

        // send sms notification to the patient assigned doctor, notifying them of the cancelled appointment
        await vonageSMS.sendCancellationMessageByPatient(patientProfile.assignedDoctor.telephone, patientName, updatedAppointment.date)
        return updatedAppointment
    }


    /**
     * This function cancels an appointment by a medical provider and sends an SMS notification to the
     * patient.
     * @param {string} appointment_id - a string representing the unique identifier of the appointment
     * being cancelled.
     * @param {User} user - The `user` parameter is an object of type `User` which contains information
     * about the medical provider who is cancelling the appointment.
     * @returns The updated appointment is being returned.
     */
    async cancelAppointmentByMedicalProvider(appointment_id: string, user: User) {
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

        else if(appointment.status == AppointmentStatus.Canceled) {
            throw new HttpException('This appointment is already cancelled.', HttpStatus.BAD_REQUEST)
        }

        await this.appointmentModel.updateOne({_id: appointment_id}, {status: AppointmentStatus.Canceled, isValid: false})
        const doctorName = `${assignedDoctorProfile.firstName} ${assignedDoctorProfile.lastName}`
        
        const updatedAppointment = await this.appointmentModel.findById(appointment_id)

        // send sms notification to the patient, notifying them of the cancelled appointment
        await vonageSMS.sendCancellationMessageByMedicalProvider(patient.telephone, doctorName, updatedAppointment.date)
        return updatedAppointment
    }



    /**
     * This function retrieves appointments from a database and decrypts sensitive information for
     * authorized users.
     * @param {User} user - The `user` parameter is an object of type `User` which contains information
     * about the user making the request. The function `getAppointments` uses this information to
     * determine whether the user is an admin or a regular user, and returns the appropriate
     * appointments based on their role.
     * @returns The function `getAppointments` returns either all appointments (if the user is an
     * admin) or appointments associated with the user (if the user is not an admin) after decrypting
     * certain fields. The returned value is an array of appointment objects.
     */
    async getAppointments(user: User) {
        if(user.role == Role.Admin) {
            var appointments = await this.appointmentModel.find().exec()
            if(!appointments.length) {
                throw new NotFoundException("Appointments not found.")
            }
            for(let appointment of appointments) {
                appointment.patient.firstName = aes.decrypt(appointment.patient.firstName)
                appointment.patient.lastName = aes.decrypt(appointment.patient.lastName)
                appointment.patient.email = aes.decrypt(appointment.patient.email)
                appointment.doctor.name = aes.decrypt(appointment.doctor.name)
                appointment.doctor.email = aes.decrypt(appointment.doctor.email)
                appointment.description = appointment.description == undefined ? null : aes.decrypt(appointment.description)
            }
            return appointments
        }
        else {
            const encryptedUserEmail = aes.encrypt(user.email)
            // get appointments of user regardless of being patient or medical provider
            var myAppointments = await this.appointmentModel.find({ $or: [ { 'doctor.email': encryptedUserEmail }, { 'patient.email': encryptedUserEmail } ] }).exec()
            if(!myAppointments.length) {
                throw new NotFoundException("Appointments not found.")
            }
            for(let appointment of myAppointments) {
                appointment.patient.firstName = aes.decrypt(appointment.patient.firstName)
                appointment.patient.lastName = aes.decrypt(appointment.patient.lastName)
                appointment.patient.email = aes.decrypt(appointment.patient.email)
                appointment.doctor.name = aes.decrypt(appointment.doctor.name)
                appointment.doctor.email = aes.decrypt(appointment.doctor.email)
                appointment.description = appointment.description == undefined ? null : aes.decrypt(appointment.description)
            }
            return myAppointments
        }
    }

    /**
     * This function retrieves an appointment by ID and decrypts certain fields based on the user's
     * role.
     * @param {string} appointment_id - The ID of the appointment that needs to be retrieved.
     * @param {User} user - The `user` parameter is an object of type `User` that represents the user
     * making the request. It is used to determine whether the user is an admin or a patient/doctor,
     * and to encrypt/decrypt sensitive information in the appointment object.
     * @returns The function `getAppointmentById` returns either an appointment object or throws an
     * HttpException with a "This appointment does not exist" message and a NOT_FOUND status code. The
     * appointment object returned is either the appointment with the given `appointment_id` if the
     * user is an admin, or the appointment with the given `appointment_id` and where the user's email
     * matches either the doctor's or patient's
     */
    async getAppointmentById(appointment_id: string, user: User) {
        if(user.role == Role.Admin) {
            const appointment = await this.appointmentModel.findById(appointment_id).exec()
            if(!appointment) {
                throw new HttpException("This appointment does not exist", HttpStatus.NOT_FOUND)
            }
            appointment.patient.firstName = aes.decrypt(appointment.patient.firstName)
            appointment.patient.lastName = aes.decrypt(appointment.patient.lastName)
            appointment.patient.email = aes.decrypt(appointment.patient.email)
            appointment.doctor.name = aes.decrypt(appointment.doctor.name)
            appointment.doctor.email = aes.decrypt(appointment.doctor.email)
            appointment.description = appointment.description == undefined ? null : aes.decrypt(appointment.description)
            return appointment
        }
        else{
            const encryptedUserEmail = aes.encrypt(user.email)
            var myAppointment = await this.appointmentModel.findOne({ $or: [ { 'doctor.email': encryptedUserEmail, '_id': appointment_id }, { 'patient.email': encryptedUserEmail, '_id': appointment_id } ] }).exec()
            if(!myAppointment) {
                throw new HttpException("This appointment does not exist", HttpStatus.NOT_FOUND)
            }
            myAppointment.patient.firstName = aes.decrypt(myAppointment.patient.firstName)
            myAppointment.patient.lastName = aes.decrypt(myAppointment.patient.lastName)
            myAppointment.patient.email = aes.decrypt(myAppointment.patient.email)
            myAppointment.doctor.name = aes.decrypt(myAppointment.doctor.name)
            myAppointment.doctor.email = aes.decrypt(myAppointment.doctor.email)
            myAppointment.description = myAppointment.description == undefined ? null : aes.decrypt(myAppointment.description)
            return myAppointment
        }
    }


    // by admin
    /**
     * This function clears all appointments and throws an HTTP exception with a message indicating
     * that the records have been deleted.
     */
    async clearAppointments() {
        await this.appointmentModel.deleteMany()
        throw new HttpException( "Records Deleted", HttpStatus.NO_CONTENT)
    }
}
