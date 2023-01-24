import { Injectable, NotFoundException, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MedicalRecord, MedicalRecordDocument } from '../schemas/medical.record.schema';
import { PatientService } from '../../profiles/services/patient.service';
import { User } from '../../users/users.schema';
import { CaslAbilityFactory } from '../../casl/casl-ability.factory';
import {Action} from '../../enums/action.enum'



@Injectable()
export class MedicalRecordService {
    constructor(
        @InjectModel(MedicalRecord.name) private medicalRecordModel: Model<MedicalRecordDocument>,
        private patientService: PatientService,
        private caslAbilityFactory: CaslAbilityFactory,
    ){}

    /*
        creating medical record with some parameters of the patients profile, this will be done by either:
        - the admin
        - the doctor assigned to the patient for which the record is created
        - the consultant of the doctor that's assigned to the patient
    */

    async createMedicalRecord( patient_id: string, complaints: string[], history_of_illness: string[], vital_signs: string[], medical_allergies: string[], habits: string[], user: User ) {
        const ability = this.caslAbilityFactory.createForUser(user)
        const patient = await this.patientService.getPatientProfileById(patient_id)

        if( ability.can(Action.Manage, 'all') ) {

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
                // issued_by: issued_by
            })

            return medicalRecord.save()

        }
        else {
            throw new HttpException('Forbidden action, as you are not responsible for this patient', HttpStatus.FORBIDDEN)
        }
    }

}
