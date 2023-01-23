import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MedicalRecord, MedicalRecordDocument } from '../schemas/medical.record.schema';

@Injectable()
export class MedicalRecordService {
    constructor(
        @InjectModel(MedicalRecord.name) private medicalRecordModel: Model<MedicalRecordDocument>
    ){}

    async createMedicalRecord(
        firstName: string, lastName: string, email: string, age: string, 
        address: string, telephone: string, complaints: string[],
        history_of_illness: string[], vital_signs: string[], medical_allergies: string[],
        habits: string[], issued_by?: string
        ) {
            // creating medicalRecord object
        const medicalRecord = new this.medicalRecordModel({
            patient_demographics: {
                firstName: firstName,
                lastName: lastName,
                email: email,
                age: age,
                address: address,
                telephone: telephone
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
