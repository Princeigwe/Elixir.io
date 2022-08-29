import { Injectable } from '@nestjs/common';
import {Model} from 'mongoose'
import { InjectModel } from '@nestjs/mongoose';
import {Patient, PatientDocument} from '../schemas/patient.schema'

@Injectable()
export class PatientService {
    constructor(@InjectModel(Patient.name) private patientModel: Model<PatientDocument>) {}

    async createPatientProfile() {}

    async getPatientProfile() {}

    async editPatientProfile() {}

    async assignDoctorToPatient() {}

    async editAssignedDoctorToPatient() {}

    async addToPatientMedication() {}

    async editPatientMedication() {}
}
