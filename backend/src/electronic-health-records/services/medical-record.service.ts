import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MedicalRecord, MedicalRecordDocument } from '../schemas/medical.record.schema';
import { PatientService } from '../../profiles/services/patient.service';


@Injectable()
export class MedicalRecordService {
    constructor(
        @InjectModel(MedicalRecord.name) private medicalRecordModel: Model<MedicalRecordDocument>,
        private patientService: PatientService
    ){}

    // creating medical record with some parameters of the patients profile
    async createMedicalRecord( patient_id: string, complaints: string[], history_of_illness: string[], vital_signs: string[], medical_allergies: string[], habits: string[], issued_by?: string ) {
        const patient = await this.patientService.getPatientProfileById(patient_id)

        // creating medicalRecord object
        const medicalRecord = new this.medicalRecordModel({
            patient_demographics: {
            firstName: patient.firstName,
            lastName: patient.lastName,
            email: patient.email,
            age: patient.age,
            address: patient.address,
            telephone: patient.telephone
            },
            treatment_history: {
                complaints: complaints,
                history_of_illness: history_of_illness,
                vital_signs: vital_signs,
                medical_allergies: medical_allergies,
                habits: habits
            },
            progress_notes: [],
            medication_list: [],
            issued_by: issued_by
        })

        return medicalRecord.save()
    }

}
