import { Injectable, NotFoundException, HttpException, HttpStatus, UseGuards, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MedicalRecord, MedicalRecordDocument } from '../schemas/medical.record.schema';
import { PatientService } from '../../profiles/services/patient.service';
import { User } from '../../users/users.schema';
import { CaslAbilityFactory } from '../../casl/casl-ability.factory';
import { DoctorService } from '../../profiles/services/doctor.service';
import { DoctorHierarchy } from '../../enums/doctor.hierarchy.enum';
import {UserCategory} from '../../enums/user.category.enum'
import { PrescriptionService } from './prescription.service';
import { ProgressNoteService } from './progress-note.service';
import * as AesEncryption from 'aes-encryption'

const aes = new AesEncryption()
aes.setSecretKey(process.env.ENCRYPTION_KEY || '11122233344455566677788822244455555555555555555231231321313aaaff')



@Injectable()
export class MedicalRecordService {
    constructor(
        @InjectModel(MedicalRecord.name) private medicalRecordModel: Model<MedicalRecordDocument>,
        private patientService: PatientService,
        // private caslAbilityFactory: CaslAbilityFactory,
        private doctorService: DoctorService,
        @Inject( forwardRef( () => PrescriptionService ) ) private prescriptionService: PrescriptionService,
        @Inject( forwardRef( () => ProgressNoteService ) ) private progressNoteService: ProgressNoteService
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
            throw new HttpException('An existing record exists for this patient, please make relevant changes to it.', HttpStatus.BAD_REQUEST)
        }

        // getting the logged in doctor's profile
        const loggedMedicalProvider = await this.doctorService.getDoctorProfileByEmail(user.email)

        // checking if the logged in doctor is a consultant in the department of the patient's assigned doctor
        const loggedMedicalProviderIsConsultantInDepartmentOfPatientAssignedDoctor = (loggedMedicalProvider['department'] == patient['assignedDoctor']['department'] && loggedMedicalProvider['hierarchy'] == DoctorHierarchy.Consultant)

        if( patient['assignedDoctor']['email'] == user.email || loggedMedicalProviderIsConsultantInDepartmentOfPatientAssignedDoctor ) {

            // creating medicalRecord object, and encrypting some sections of it before saving to database
            // * the encrypted properties of the medical record are the patient's demographics data and the medical provider that created the record
            const loggedMedicalProvider = await this.doctorService.getDoctorProfileByEmail(user.email)

            // these parameters cannot be empty because of the MedicalRecordDto
            complaints = complaints.map(complaint => aes.encrypt(complaint))
            history_of_illness = history_of_illness.map(illness => aes.encrypt(illness))
            vital_signs = vital_signs.map(vital_sign => aes.encrypt(vital_sign))
            
            if(medical_allergies){
                if(medical_allergies.length) {medical_allergies = medical_allergies.map(allergy => aes.encrypt(allergy))}
            }
            if(habits){
                if(habits.length) {habits = habits.map(habit => aes.encrypt(habit))}
            }

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

            await medicalRecord.save()
            return await this.getMedicalRecordByID(medicalRecord._id)
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
        
        const medicalRecord = await this.medicalRecordModel.findById(record_id).exec()
        if(!medicalRecord) {
            throw new NotFoundException("Record not Found")
        }
        const loggedMedicalProvider = await this.doctorService.getDoctorProfileByEmail(user.email)

        // getting the details of the patient that owns the medical record
        const patient = await this.patientService.getPatientWithEmail( aes.decrypt(medicalRecord.patient_demographics.email) )

        // checking if the logged in doctor is a consultant in the department of the patient's assigned doctor
        const loggedMedicalProviderIsConsultantInDepartmentOfPatientAssignedDoctor = (loggedMedicalProvider['department'] == patient['assignedDoctor']['department'] && loggedMedicalProvider['hierarchy'] == DoctorHierarchy.Consultant)

        treatment_history__complaints         = treatment_history__complaints != undefined && treatment_history__complaints.length ? treatment_history__complaints.map(complain => aes.encrypt(complain)) : medicalRecord.treatment_history.complaints
        treatment_history__history_of_illness = treatment_history__history_of_illness != undefined && treatment_history__history_of_illness.length ? treatment_history__history_of_illness.map(illness => aes.encrypt(illness)) : medicalRecord.treatment_history.history_of_illness
        treatment_history__vital_signs        = treatment_history__vital_signs.map(vital_sign => aes.encrypt(vital_sign)) // this cannot be undefined because of the UpdateMedicalRecordDto handling this function. the property is not optional
        treatment_history__medical_allergies  = treatment_history__medical_allergies != undefined && treatment_history__medical_allergies.length ? treatment_history__medical_allergies.map( medical_allergy => aes.encrypt(medical_allergy)) : medicalRecord.treatment_history.medical_allergies
        treatment_history__habits             = treatment_history__habits != undefined && treatment_history__habits.length ? treatment_history__habits.map(habit => aes.encrypt(habit)) : medicalRecord.treatment_history.habits

        if( patient['assignedDoctor']['email'] == user.email || loggedMedicalProviderIsConsultantInDepartmentOfPatientAssignedDoctor ) {
            
            await this.medicalRecordModel.findByIdAndUpdate( {'_id': medicalRecord._id}, { $set: { 
                'treatment_history.complaints':  treatment_history__complaints, 
                'treatment_history.history_of_illness': treatment_history__history_of_illness, 
                'treatment_history.vital_signs': treatment_history__vital_signs, 
                'treatment_history.medical_allergies': treatment_history__medical_allergies, 
                'treatment_history.habits': treatment_history__habits, 
                'updated_by.doctor_firstName': aes.encrypt(loggedMedicalProvider.firstName), 
                'updated_by.doctor_lastName': aes.encrypt(loggedMedicalProvider.lastName), 
                'updated_by.doctor_department': aes.encrypt(loggedMedicalProvider.department)  } }, 
                {new: true}
            )

            return await this.getMedicalRecordByID(record_id)
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

            const decryptedTreatmentHistory = {
                complaints         : medicalRecord.treatment_history.complaints.length ? medicalRecord.treatment_history.complaints.map(complaint => aes.decrypt(complaint)) : [],
                history_of_illness : medicalRecord.treatment_history.history_of_illness.length ? medicalRecord.treatment_history.history_of_illness.map(illness => aes.decrypt(illness)) : [],
                vital_signs        : medicalRecord.treatment_history.vital_signs.length ? medicalRecord.treatment_history.vital_signs.map(vital_sign => aes.decrypt(vital_sign)) : [],
                medical_allergies  : medicalRecord.treatment_history.medical_allergies.length ? medicalRecord.treatment_history.medical_allergies.map(medical_allergy => aes.decrypt(medical_allergy)) : [],
                habits             : medicalRecord.treatment_history.habits.length ? medicalRecord.treatment_history.habits.map(habit => aes.decrypt(habit)) : []
            }

            // decrypting the issued_by property of each medical record document
            const decryptedIssuedBy = {
                doctor_firstName: aes.decrypt(medicalRecord.issued_by['doctor_firstName']),
                doctor_lastName: aes.decrypt(medicalRecord.issued_by['doctor_lastName']),
                doctor_department: aes.decrypt(medicalRecord.issued_by['doctor_department']),

            }

            const decryptedUpdatedBy = {
                doctor_firstName: medicalRecord.updated_by['doctor_firstName']   == undefined ? null:  aes.decrypt(medicalRecord.updated_by['doctor_firstName']),
                doctor_lastName: medicalRecord.updated_by['doctor_lastName']     == undefined ? null:  aes.decrypt(medicalRecord.updated_by['doctor_lastName']),
                doctor_department: medicalRecord.updated_by['doctor_department'] == undefined ? null:  aes.decrypt(medicalRecord.updated_by['doctor_department']),
            }

            return { 
                _id: medicalRecord._id.toString(), 
                patient_demographics: decryptedPatientDemographics, 
                treatment_history: decryptedTreatmentHistory, 
                issued_by: decryptedIssuedBy, 
                updated_by: decryptedUpdatedBy,
                createdAt: medicalRecord['createdAt'], 
                updatedAt: medicalRecord['updatedAt'], 
                __v: medicalRecord.__v 
            }
        } )

        return decryptedMedicalRecords
    }


    // function to read the details of a medical record by its id
    // this method will be called for admin user or assigned doctor
    async getMedicalRecordByID(record_id: string) {
        let medicalRecord = await this.medicalRecordModel.findById(record_id).exec()
        if(!medicalRecord) { throw new NotFoundException("Record not found") }

        // decrypting the encrypted data
        medicalRecord.patient_demographics.firstName = aes.decrypt(medicalRecord.patient_demographics.firstName)
        medicalRecord.patient_demographics.lastName  = aes.decrypt(medicalRecord.patient_demographics.lastName),
        medicalRecord.patient_demographics.email     = aes.decrypt(medicalRecord.patient_demographics.email),
        medicalRecord.patient_demographics.address   = aes.decrypt(medicalRecord.patient_demographics.address),
        medicalRecord.patient_demographics.telephone = aes.decrypt(medicalRecord.patient_demographics.telephone)

        medicalRecord.treatment_history.complaints         = medicalRecord.treatment_history.complaints.length ? medicalRecord.treatment_history.complaints.map(complaint => aes.decrypt(complaint)) : []
        medicalRecord.treatment_history.history_of_illness = medicalRecord.treatment_history.history_of_illness.length ? medicalRecord.treatment_history.history_of_illness.map(illness => aes.decrypt(illness)) : []
        medicalRecord.treatment_history.vital_signs        = medicalRecord.treatment_history.vital_signs.length ? medicalRecord.treatment_history.vital_signs.map(vital_sign => aes.decrypt(vital_sign)) : []
        medicalRecord.treatment_history.medical_allergies  = medicalRecord.treatment_history.medical_allergies.length ? medicalRecord.treatment_history.medical_allergies.map(medical_allergy => aes.decrypt(medical_allergy)) : []
        medicalRecord.treatment_history.habits             = medicalRecord.treatment_history.habits.length ? medicalRecord.treatment_history.habits.map(habit => aes.decrypt(habit)) : []

        medicalRecord.issued_by['doctor_firstName']  = aes.decrypt(medicalRecord.issued_by['doctor_firstName'])
        medicalRecord.issued_by['doctor_lastName']   = aes.decrypt(medicalRecord.issued_by['doctor_lastName'])
        medicalRecord.issued_by['doctor_department'] = aes.decrypt(medicalRecord.issued_by['doctor_department'])

        medicalRecord.updated_by['doctor_firstName']  = medicalRecord.updated_by['doctor_firstName']  == undefined ? null:  aes.decrypt(medicalRecord.updated_by['doctor_firstName'])
        medicalRecord.updated_by['doctor_lastName']   = medicalRecord.updated_by['doctor_lastName']   == undefined ? null:  aes.decrypt(medicalRecord.updated_by['doctor_lastName'])
        medicalRecord.updated_by['doctor_department'] = medicalRecord.updated_by['doctor_department'] == undefined ? null:  aes.decrypt(medicalRecord.updated_by['doctor_department'])

        return medicalRecord
    }


    // this action allows a patient access records owned
    async getLoggedInPatientRecord(user: User) {
        const medicalRecord = await this.medicalRecordModel.findOne({'patient_demographics.email': aes.encrypt(user.email)}).exec()
        if(!medicalRecord) { throw new NotFoundException("Record not found.") }
        return await this.getMedicalRecordByID(medicalRecord._id)
    }


    /**
     * It checks if the logged in medical provider is in the recipients list of the medical record. If
     * not, it throws an error
     * @param {string} record_id - the id of the medical record
     * @param {User} user - User - this is the user object that is passed in from the auth.guard.ts
     * file.
     * @returns The medical record is being returned.
     */
    async readActionOfMedicalRecordByMedicalProvider(record_id: string, user: User) {
        // get details of logged in medical provider
        const loggedMedicalProvider = await this.doctorService.getDoctorProfileByEmail(user.email)

        const medicalRecord = await this.getMedicalRecordByID(record_id)  // this fetches the decrypted medical record by ID

        // if the email of logged in provider is not in the recipients property of the medical record, don't allow access
        if (medicalRecord.recipients.includes(aes.encrypt(loggedMedicalProvider.email)) == false) {
            throw new HttpException('Forbidden action. Request for access to medical record from patient', HttpStatus.FORBIDDEN)
        }
        return medicalRecord
    }


    /**
     * This function allows a patient to grant read access to a medical provider to their medical
     * record
     * @param {User} user - User - this is the user object that is passed in from the controller.
     * @param {string} record_id - the id of the medical record that you want to grant access to
     * @param {string} medical_provider_email - The email of the medical provider that you want to
     * grant access to.
     * @returns a message that the user has successfully granted read access to the medical provider.
     */
    async grantReadAccessOfMedicalRecordToMedicalProvider(user: User, record_id: string, medical_provider_email: string) {
        const medicalRecord = await this.getMedicalRecordByID(record_id)

        const medicalProvider = await this.doctorService.getDoctorProfileByEmail(medical_provider_email)

        if( medicalRecord.patient_demographics.email == user.email ) {
            await this.medicalRecordModel.updateOne({'_id': medicalRecord._id}, { $addToSet: { 'recipients': aes.encrypt(medical_provider_email) } })
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


    //** this action will only be performed by an administrative user */
    async deleteMedicalRecords() {
        const recordPrescriptions = await this.prescriptionService.getAllPrescriptions()
        const progressNotes = await this.progressNoteService.getAllProgressNotes()

        if(recordPrescriptions.length) {
            throw new HttpException('There are prescriptions tied to medical records, please delete them before attempting to delete record', HttpStatus.BAD_REQUEST)
        }
        else if(progressNotes.length) {
            throw new HttpException('There are progress notes tied to medical records, please delete them before attempting to delete record', HttpStatus.BAD_REQUEST)
        }
        await this.medicalRecordModel.deleteMany()
        throw new HttpException( "Records Deleted", HttpStatus.NO_CONTENT)
    }

    //** this action will only be performed by an administrative user */
    async deleteMedicalRecord(medical_record_id: string) {
        const recordPrescriptions = await this.prescriptionService.getPrescriptionsTiedToMedicalRecord(medical_record_id)
        const progressNotes = await this.progressNoteService.getProgressNotesTiedToMedicalRecord(medical_record_id)
        if(recordPrescriptions.length) {
            throw new HttpException('There is/are prescription(s) tied to this medical record, please delete them before attempting to delete record', HttpStatus.BAD_REQUEST)
        }
        if(progressNotes.length) {
            throw new HttpException('There is/are progress note(s) tied to this medical record, please delete them before attempting to delete record', HttpStatus.BAD_REQUEST)
        }
        await this.medicalRecordModel.deleteOne({'__id': medical_record_id})
        throw new HttpException( "Record Deleted", HttpStatus.NO_CONTENT)
    }

}
