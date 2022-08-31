import { Injectable, NotFoundException } from '@nestjs/common';
import {Model} from 'mongoose'
import { InjectModel } from '@nestjs/mongoose';
import {Patient, PatientDocument} from '../schemas/patient.schema'
import {OnEvent} from '@nestjs/event-emitter'
import {NewUserEvent} from '../../events/createProfileByUser.event'

@Injectable()
export class PatientService {
    constructor(
        @InjectModel(Patient.name) private patientModel: Model<PatientDocument>,
    ) {}

    @OnEvent('new.user')
    async createPatientProfile(payload: NewUserEvent) {
        const patient = new this.patientModel({user: payload.user})
        return patient.save()
    }

    async getPatientProfiles() {
        const patients =  await this.patientModel.find().exec()
        if(!patients.length) {throw new NotFoundException("Patients Not Found")}
        return patients
    }

    async getPatientProfileById(_id: string) {
        const patient = await this.patientModel.findOne({'_id': _id}).exec()
        if (!patient) {throw new NotFoundException("Patient Not Found")}
        return patient
    }

    // this method will help patient fill up or edit profile without touching medical details and user object id
    async editBasicPatientProfileById(_id: string, attrs: Pick<Patient, 'firstName' | 'lastName' | 'age' | 'address' | 'telephone' | 'occupation' | 'maritalStatus'>) {
        const patient = await this.getPatientProfileById(_id)
        Object.assign(patient, attrs)
        return patient.save()
    }

    // this method will only be executed by a medical provider
    async addToPatientPrescriptionById(id: string) {}

    // this method will only be executed by a medical provider

    async editPatientPrescriptionById() {}

    async assignDoctorToPatient() {}

    async editAssignedDoctorToPatient() {}

    async deletePatientsProfiles() {
        await this.patientModel.deleteMany().exec()
    }

}
