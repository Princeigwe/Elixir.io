import { Injectable, NotFoundException, HttpException, HttpStatus, UseGuards } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MedicalRecord, MedicalRecordDocument } from '../schemas/medical.record.schema';
import { PatientService } from '../../profiles/services/patient.service';
import { User } from '../../users/users.schema';
import { CaslAbilityFactory } from '../../casl/casl-ability.factory';
import { DoctorService } from '../../profiles/services/doctor.service';
import { DoctorHierarchy } from '../../enums/doctor.hierarchy.enum';
import {UserCategory} from '../../enums/user.category.enum'
import * as AesEncryption from 'aes-encryption'

const aes = new AesEncryption()
aes.setSecretKey(process.env.ENCRYPTION_KEY)



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

        if(user.category == UserCategory.Patient) {
            throw new HttpException('Forbidden action, records are kept confidential for medical staffs', HttpStatus.FORBIDDEN)
        }

        const patient = await this.patientService.getPatientProfileById(patient_id)

        const existingMedicalRecord = await this.medicalRecordModel.findOne({'patient_demographics.email': aes.encrypt(patient.email)}).exec() // this line fetches a record that has the encrypted email of the patient in question

        if( existingMedicalRecord ){
            throw new HttpException('An existing record exists for this patient, please make relevant changes to it.', HttpStatus.FORBIDDEN)
        }

        // getting the logged in doctor's profile
        const loggedMedicalProvider = await this.doctorService.getDoctorProfileByEmail(user.email)

        // checking if the logged in doctor is a consultant in the department of the patient's assigned doctor
        const loggedMedicalProviderIsConsultantInDepartmentOfPatientAssignedDoctor = (loggedMedicalProvider['department'] == patient['assignedDoctor']['department'] && loggedMedicalProvider['hierarchy'] == DoctorHierarchy.Consultant)

        if( patient['assignedDoctor']['email'] == user.email || loggedMedicalProviderIsConsultantInDepartmentOfPatientAssignedDoctor ) {

            // creating medicalRecord object, and encrypting some sections of it before saving to database
            // * the encrypted properties of the medical record are the patient's demographics data and the medical provider that created the record
            const loggedMedicalProvider = await this.doctorService.getDoctorProfileByEmail(user.email)
            const medicalRecord = new this.medicalRecordModel({
                patient_demographics: {
                    firstName: aes.encrypt(patient.firstName),
                    lastName: aes.encrypt(patient.lastName),
                    email: aes.encrypt(patient.email),
                    age: patient.age, // encryption package does not work with number
                    address: aes.encrypt(patient.address),
                    telephone: aes.encrypt(patient.telephone)
                },
                treatment_history: {
                    complaints: complaints,
                    history_of_illness: history_of_illness,
                    vital_signs: vital_signs,
                    medical_allergies: medical_allergies,
                    habits: habits
                },
                issued_by: {
                    doctor_firstName: aes.encrypt(loggedMedicalProvider.firstName),
                    doctor_lastName: aes.encrypt(loggedMedicalProvider.lastName),
                    doctor_department: aes.encrypt(loggedMedicalProvider.department)
                },
                recipients: [
                    aes.encrypt(loggedMedicalProvider.email)
                ]
            })

            return medicalRecord.save()
        }
        
        else {
            throw new HttpException('Forbidden action, as you are not responsible for this patient', HttpStatus.FORBIDDEN)
        }
    }


    // method to allow only the treatment subset of a medical record to be updated by a medical provider
    async updateMedicalRecordByID(
        record_id: string, user: User, 
        treatment_history__complaints: string[], treatment_history__history_of_illness: string[], 
        treatment_history__vital_signs: string[], treatment_history__medical_allergies: string[], 
        treatment_history__habits: string[] 
        ) {
        
        const medicalRecord = await this.getMedicalRecordByID(record_id)
        const loggedMedicalProvider = await this.doctorService.getDoctorProfileByEmail(user.email)

        // getting the details of the patient that owns the medical record
        const patient = await this.patientService.getPatientProfileByEmail(aes.decrypt(medicalRecord.patient_demographics.email))

        // checking if the logged in doctor is a consultant in the department of the patient's assigned doctor
        const loggedMedicalProviderIsConsultantInDepartmentOfPatientAssignedDoctor = (loggedMedicalProvider['department'] == patient['assignedDoctor']['department'] && loggedMedicalProvider['hierarchy'] == DoctorHierarchy.Consultant)

        if( patient['assignedDoctor']['email'] == user.email || loggedMedicalProviderIsConsultantInDepartmentOfPatientAssignedDoctor ) {
            
            return await this.medicalRecordModel.findByIdAndUpdate( {'_id': medicalRecord._id}, { $set: { 
                'treatment_history.complaints': treatment_history__complaints, 
                'treatment_history.history_of_illness': treatment_history__history_of_illness, 
                'treatment_history.vital_signs': treatment_history__vital_signs, 
                'treatment_history.medical_allergies': treatment_history__medical_allergies, 
                'treatment_history.habits': treatment_history__habits, 'updated_by.doctor_firstName': loggedMedicalProvider.firstName, 
                'updated_by.doctor_lastName': loggedMedicalProvider.lastName, 'updated_by.doctor_department': loggedMedicalProvider.department  } }, 
                {new: true}
            )
        }
        else{
            throw new HttpException('Forbidden action, as you are not responsible for this patient', HttpStatus.FORBIDDEN)
        }

    }


    // this action will only be performed by the administrative users
    // this function get the encrypted records, decrypts the encrypted data for each document, and returns their decrypted values
    async getMedicalRecords() {
        const medicalRecords = await this.medicalRecordModel.find().exec()
        if(!medicalRecords.length) {throw new NotFoundException("Records not found.")}
        const decryptedMedicalRecords = medicalRecords.map(medicalRecord =>  {

            // decrypting the patient_demographics property of each medical record document
            const decryptedPatientDemographics = {
                firstName : aes.decrypt(medicalRecord.patient_demographics['firstName']),
                lastName : aes.decrypt(medicalRecord.patient_demographics['lastName']),
                email : aes.decrypt(medicalRecord.patient_demographics['email']),
                age : medicalRecord.patient_demographics['age'],
                address : aes.decrypt(medicalRecord.patient_demographics['address']),
                telephone : aes.decrypt(medicalRecord.patient_demographics['telephone'])
            }

            // decrypting the issued_by property of each medical record document
            const decryptedIssuedBy = {
                doctor_firstName: aes.decrypt(medicalRecord.issued_by['doctor_firstName']),
                doctor_lastName: aes.decrypt(medicalRecord.issued_by['doctor_lastName']),
                doctor_department: aes.decrypt(medicalRecord.issued_by['doctor_department']),

            }

            return { _id: medicalRecord._id.toString(), patient_demographics: decryptedPatientDemographics, treatment_history: medicalRecord.treatment_history, issued_by: decryptedIssuedBy, createdAt: medicalRecord['createdAt'], updatedAt: medicalRecord['updatedAt'], __v: medicalRecord.__v }
        } )

        return decryptedMedicalRecords
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
            throw new HttpException('Forbidden action. Request for access to medical record from patient', HttpStatus.FORBIDDEN)
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
            throw new HttpException('Forbidden Action', HttpStatus.FORBIDDEN)
        }
    }


    // this method allows a patient revoke read access of a medical provider
    async revokeReadAccessOfMedicalRecordFromMedicalProvider(user: User, record_id: string, medical_provider_email: string) {
        const medicalRecord = await this.getMedicalRecordByID(record_id)

        const medicalProvider = await this.doctorService.getDoctorProfileByEmail(medical_provider_email)

        if( medicalRecord.patient_demographics.email == user.email ) {
            await this.medicalRecordModel.updateOne({'_id': medicalRecord._id}, { $pull: { 'recipients': medical_provider_email } })
            return { message: `You have successfully revoked read access from ${medicalProvider.firstName} ${medicalProvider.lastName}` }
        }

        else {
            throw new HttpException('Forbidden Action', HttpStatus.FORBIDDEN)
        }
    }


    //** this action will conly be performed by an administrative user */
    async deleteMedicalRecords( user:User ) {
        await this.medicalRecordModel.deleteMany()
        throw new HttpException( "Records Deleted", HttpStatus.NO_CONTENT)
    }

}
