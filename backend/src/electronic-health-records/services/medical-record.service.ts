import { Injectable, NotFoundException, HttpException, HttpStatus, UseGuards } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MedicalRecord, MedicalRecordDocument } from '../schemas/medical.record.schema';
import { PatientService } from '../../profiles/services/patient.service';
import { User } from '../../users/users.schema';
import { CaslAbilityFactory } from '../../casl/casl-ability.factory';
import {Action} from '../../enums/action.enum'
import { DoctorService } from '../../profiles/services/doctor.service';
import { DoctorHierarchy } from '../../enums/doctor.hierarchy.enum';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';



@Injectable()
export class MedicalRecordService {
    constructor(
        @InjectModel(MedicalRecord.name) private medicalRecordModel: Model<MedicalRecordDocument>,
        private patientService: PatientService,
        private caslAbilityFactory: CaslAbilityFactory,
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
                },
                recipients: [
                    loggedMedicalProvider.email
                ]
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
        if(!medicalRecords.length) {throw new NotFoundException("Records not found.")}
        return medicalRecords
    }


    // function to read the details of a medical record by its id
    // this method will be called for admin user or assigned doctor, or logged in patient
    async getMedicalRecordByID(record_id: string) {
        const medicalRecord = await this.medicalRecordModel.findById(record_id).exec()
        if(!medicalRecord) { throw new NotFoundException("Record not found") }
        return medicalRecord
    }


    // this action allows a patient access records owned
    async getLoggedInPatientRecords(user: User) {
        const medicalRecords = await this.medicalRecordModel.find({'patient_demographics.email': user.email}).exec()
        if(!medicalRecords.length) { throw new NotFoundException("Records not found.") }
        return medicalRecords
    }


    async readMedicalRecordOfLoggedInPatientByID(record_id: string, user:User) {
        const medicalRecord = await this.getMedicalRecordByID(record_id)
        if( medicalRecord.patient_demographics.email == user.email ) {
            return medicalRecord
        }
        else {
            throw new HttpException('Forbidden Resource', HttpStatus.FORBIDDEN)
        }
    }


    // this list will be used to give access to a medical record to a medical provider, by a patient
    async readActionOfMedicalRecordByMedicalProvider(record_id: string, user: User) {
        // get details of logged in medical provider
        const loggedMedicalProvider = await this.doctorService.getDoctorProfileByEmail(user.email)

        const medicalRecord = await this.medicalRecordModel.findById(record_id).exec()

        // if the email of logged in provider is not in the recipients property of the medical record, don't allow access
        if (medicalRecord.recipients.includes(loggedMedicalProvider.email) == false) {
            throw new HttpException('Forbidden Resource. Request for read access from patient', HttpStatus.FORBIDDEN)
        }

        return medicalRecord
    }


    // this method allows a patient grant read access of a medical provider
    async grantReadAccessOfMedicalRecordToMedicalProvider(user: User, record_id: string, medical_provider_email: string) {
        const medicalRecord = await this.getMedicalRecordByID(record_id)

        const medicalProvider = await this.doctorService.getDoctorProfileByEmail(medical_provider_email)

        if( medicalRecord.patient_demographics.email == user.email ) {
            await this.medicalRecordModel.updateOne({'_id': medicalRecord._id}, { $addToSet: { 'recipients': medical_provider_email } })
            return { message: `You have successfully granted read access to ${medicalProvider.firstName} ${medicalProvider.lastName}` }
        }

        else {
            throw new HttpException('Forbidden Resource', HttpStatus.FORBIDDEN)
        }
    }

    // async getOrSearchRecordsOfPatientsUnderCare(patient_id: string, ) {

    // }

}
