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

    async getPatientProfile() {}

    async editPatientProfile() {}

    async assignDoctorToPatient() {}

    async editAssignedDoctorToPatient() {}

    async addToPatientMedication() {}

    async editPatientMedication() {}
}
