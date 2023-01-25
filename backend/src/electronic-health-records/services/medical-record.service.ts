import { Injectable, NotFoundException, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MedicalRecord, MedicalRecordDocument } from '../schemas/medical.record.schema';
import { PatientService } from '../../profiles/services/patient.service';
import { User } from '../../users/users.schema';
import { CaslAbilityFactory } from '../../casl/casl-ability.factory';
// import {Action} from '../../enums/action.enum'
import { DoctorService } from '../../profiles/services/doctor.service';
import { DoctorHierarchy } from '../../enums/doctor.hierarchy.enum';



@Injectable()
export class MedicalRecordService {
    constructor(
        @InjectModel(MedicalRecord.name) private medicalRecordModel: Model<MedicalRecordDocument>,
        private patientService: PatientService,
        // private caslAbilityFactory: CaslAbilityFactory,
        private doctorService: DoctorService
    ){}

    /*
        creating medical record with some parameters of the patients profile, this will be done by either:
        - the doctor assigned to the patient for which the record is created
        - the consultant of the doctor that's assigned to the patient
    */

    async createMedicalRecord( patient_id: string, complaints: string[], history_of_illness: string[], vital_signs: string[], medical_allergies: string[], habits: string[], user: User ) {
        const patient = await this.patientService.getPatientProfileById(patient_id)

        // getting the logged in doctor's profile
        const loggedMedicalProvider = await this.doctorService.getDoctorProfileByEmail(user.email)

        // checking if the logged in doctor is a consultant in the department of the patient's assigned doctor
        const loggedMedicalProviderIsConsultantInDepartmentOfPatientAssignedDoctor = (loggedMedicalProvider['department'] == patient['assignedDoctor']['department'] && loggedMedicalProvider['hierarchy'] == DoctorHierarchy.Consultant)

        if( patient['assignedDoctor']['email'] == user.email || loggedMedicalProviderIsConsultantInDepartmentOfPatientAssignedDoctor ) {

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
                issued_by: {
                    doctor_firstName: loggedMedicalProvider.firstName,
                    doctor_lastName: loggedMedicalProvider.lastName,
                    doctor_department: loggedMedicalProvider.department
                }
            })

            return medicalRecord.save()

        }
        else {
            throw new HttpException('Forbidden action, as you are not responsible for this patient', HttpStatus.FORBIDDEN)
        }
    }


    // this action will only be performed by the administrative users 
    async getMedicalRecords() {
        const medicalRecords = await this.medicalRecordModel.find().exec()
        return medicalRecords
    }

}
