import { Injectable, NotFoundException, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel }  from '@nestjs/mongoose';
import {Model} from 'mongoose'
import { ProgressNote, ProgressNoteDocument } from '../schemas/progress.note.schema';
import {User} from '../../users/users.schema'
import * as AesEncryption from 'aes-encryption'
import { Role } from 'src/enums/role.enum';
import { DoctorService } from '../../profiles/services/doctor.service';
import { MedicalRecordService } from './medical-record.service';

const aes = new AesEncryption()
aes.setSecretKey(process.env.ENCRYPTION_KEY)


@Injectable()
export class ProgressNoteService {

    constructor(
        @InjectModel(ProgressNote.name) private progressNoteModel: Model<ProgressNoteDocument>,
        private medicalRecordService: MedicalRecordService,
        private doctorService: DoctorService
    ) {}


    async createProgressNoteForMedicalRecord(medical_record_id: string, subjectiveInformation: string, objectiveInformation: string, assessment: string, plan: string, progress: string, user: User) {
        const medicalRecord = await this.medicalRecordService.readActionOfMedicalRecordByMedicalProvider(medical_record_id, user)
        const medicalProvider = await this.doctorService.getDoctorProfileByEmail(user.email)

        const progressNote = await this.progressNoteModel.create({
            medicalRecord: medicalRecord._id,
            patient_demographics: {
                firstName: aes.encrypt(medicalRecord.patient_demographics.firstName),
                lastName:  aes.encrypt(medicalRecord.patient_demographics.lastName),
                email:     aes.encrypt(medicalRecord.patient_demographics.email),
                age:       medicalRecord.patient_demographics.age,
                address:   aes.encrypt(medicalRecord.patient_demographics.address),
                telephone: aes.encrypt(medicalRecord.patient_demographics.telephone),
            },
            subjectiveInformation: subjectiveInformation == undefined ? null : aes.encrypt(subjectiveInformation),
            objectiveInformation:  objectiveInformation  == undefined ? null : aes.encrypt(objectiveInformation),
            assessment:            assessment            == undefined ? null : aes.encrypt(assessment),
            plan:                  plan                  == undefined ? null :aes.encrypt(plan),
            progress:              aes.encrypt(progress), // progress cannot be undefined because of the dto defined

            issued_by: {
                doctor_firstName:  aes.encrypt(medicalProvider.firstName),
                doctor_lastName:   aes.encrypt(medicalProvider.lastName),
                doctor_department: aes.encrypt(medicalProvider.department),
                doctor_email:      aes.encrypt(medicalProvider.email),
                doctor_telephone:  aes.encrypt(medicalProvider.telephone),
            }
        }) 

        return progressNote.save()
    }


    // * this action will be performed by an administrator to read all progress notes
    async getAllProgressNotes() {
        const progressNotes = await this.progressNoteModel.find().exec()
        if(!progressNotes.length) { throw new NotFoundException("Progress notes not found") }

        const decryptedProgressNotes = progressNotes.map(progressNote => {

            const decryptedPatientDemographics = {
                firstName:  aes.decrypt(progressNote.patient_demographics.firstName),
                lastName:   aes.decrypt(progressNote.patient_demographics.lastName),
                email:      aes.decrypt(progressNote.patient_demographics.email),
                age:        progressNote.patient_demographics.age,
                address:    aes.decrypt(progressNote.patient_demographics.address),
                telephone:  aes.decrypt(progressNote.patient_demographics.telephone)
            }

            const decryptedSubjectiveInformation = progressNote.subjectiveInformation == undefined ? null : aes.decrypt(progressNote.subjectiveInformation)
            const decryptedObjectiveInformation  = progressNote.objectiveInformation  == undefined ? null : aes.decrypt(progressNote.objectiveInformation)
            const decryptedAssessment            = progressNote.assessment            == undefined ? null : aes.decrypt(progressNote.assessment)
            const decryptedPlan                  = progressNote.plan                  == undefined ? null : aes.decrypt(progressNote.plan)
            const decryptedProgress              = aes.decrypt(progressNote.progress) // the elvis operator is not used here because it can't be without a value when creating a progress note

            const decryptedIssuedBy = {
                doctor_firstName:  aes.decrypt(progressNote.issued_by['doctor_firstName']),
                doctor_lastName:   aes.decrypt(progressNote.issued_by['doctor_lastName']),
                doctor_department: aes.decrypt(progressNote.issued_by['doctor_department']),
                doctor_email:      aes.decrypt(progressNote.issued_by['doctor_email']),
                doctor_telephone:  aes.decrypt(progressNote.issued_by['doctor_telephone']),
            }

            return {
                _id:                   progressNote._id.toString(),
                medicalRecord:         progressNote.medicalRecord['_id'],
                patientDemographics:   decryptedPatientDemographics,
                subjectiveInformation: decryptedSubjectiveInformation,
                objectiveInformation:  decryptedObjectiveInformation,
                assessment:            decryptedAssessment,
                plan:                  decryptedPlan,
                progress:              decryptedProgress,
                issuedBy:              decryptedIssuedBy
            }
        })

        return decryptedProgressNotes
    }


    async filterProgressNotesTiedToMedicalRecord(medical_record_id: string, user: User) {
        const progressNotes = await this.progressNoteModel.find({'medicalRecord': medical_record_id}).exec()
        const medicalRecord = await this.medicalRecordService.getMedicalRecordByID(medical_record_id)

        if (!progressNotes.length) { throw new NotFoundException("Progress notes not found") }

        const decryptedProgressNotes = progressNotes.map( progressNote => {

            const decryptedPatientDemographics = {
                firstName:  aes.decrypt(progressNote.patient_demographics.firstName),
                lastName:   aes.decrypt(progressNote.patient_demographics.lastName),
                email:      aes.decrypt(progressNote.patient_demographics.email),
                age:        progressNote.patient_demographics.age,
                address:    aes.decrypt(progressNote.patient_demographics.address),
                telephone:  aes.decrypt(progressNote.patient_demographics.telephone)
            }

            const decryptedSubjectiveInformation = progressNote.subjectiveInformation == undefined ? null : aes.decrypt(progressNote.subjectiveInformation)
            const decryptedObjectiveInformation  = progressNote.objectiveInformation  == undefined ? null : aes.decrypt(progressNote.objectiveInformation)
            const decryptedAssessment            = progressNote.assessment            == undefined ? null : aes.decrypt(progressNote.assessment)
            const decryptedPlan                  = progressNote.plan                  == undefined ? null : aes.decrypt(progressNote.plan)
            const decryptedProgress              = aes.decrypt(progressNote.progress) // the elvis operator is not used here because it can't be without a value when creating a progress note

            const decryptedIssuedBy = {
                doctor_firstName:  aes.decrypt(progressNote.issued_by['doctor_firstName']),
                doctor_lastName:   aes.decrypt(progressNote.issued_by['doctor_lastName']),
                doctor_department: aes.decrypt(progressNote.issued_by['doctor_department']),
                doctor_email:      aes.decrypt(progressNote.issued_by['doctor_email']),
                doctor_telephone:  aes.decrypt(progressNote.issued_by['doctor_telephone']),
            }

            return {
                _id:                   progressNote._id.toString(),
                medicalRecord:         progressNote.medicalRecord['_id'],
                patientDemographics:   decryptedPatientDemographics,
                subjectiveInformation: decryptedSubjectiveInformation,
                objectiveInformation:  decryptedObjectiveInformation,
                assessment:            decryptedAssessment,
                plan:                  decryptedPlan,
                progress:              decryptedProgress,
                issuedBy:              decryptedIssuedBy
            }

        } )

        if( user.role == Role.Admin || medicalRecord.recipients.includes(aes.encrypt(user.email)) == true){
            return decryptedProgressNotes
        }
        else {
            throw new HttpException("Unauthorized access to progress notes. If you are a medical provider, request read access to medical record", HttpStatus.FORBIDDEN)
        }

    }


    async getProgressNoteByID(progress_note_id: string, user: User) {

        const progressNote = await this.progressNoteModel.findById(progress_note_id).exec()
        if(!progressNote) {
            throw new HttpException('Progress note not found', HttpStatus.NOT_FOUND)
        }

        // decrypting the encrypted data
        progressNote.patient_demographics.firstName = aes.decrypt(progressNote.patient_demographics.firstName)
        progressNote.patient_demographics.lastName  = aes.decrypt(progressNote.patient_demographics.lastName),
        progressNote.patient_demographics.email     = aes.decrypt(progressNote.patient_demographics.email),
        progressNote.patient_demographics.address   = aes.decrypt(progressNote.patient_demographics.address),
        progressNote.patient_demographics.telephone = aes.decrypt(progressNote.patient_demographics.telephone)

        progressNote.subjectiveInformation = progressNote.subjectiveInformation == undefined ? null : aes.decrypt(progressNote.subjectiveInformation)
        progressNote.objectiveInformation  = progressNote.objectiveInformation  == undefined ? null : aes.decrypt(progressNote.objectiveInformation)
        progressNote.assessment            = progressNote.assessment            == undefined ? null : aes.decrypt(progressNote.assessment)
        progressNote.plan                  = progressNote.plan                  == undefined ? null : aes.decrypt(progressNote.plan)
        progressNote.progress              = aes.decrypt(progressNote.progress) // the elvis operator is not used here because it can't be without a value when creating a progress note

        progressNote.issued_by['doctor_firstName']  = aes.decrypt(progressNote.issued_by['doctor_firstName'])
        progressNote.issued_by['doctor_lastName']   = aes.decrypt(progressNote.issued_by['doctor_lastName'])
        progressNote.issued_by['doctor_department'] = aes.decrypt(progressNote.issued_by['doctor_department'])
        progressNote.issued_by['doctor_email']      = aes.decrypt(progressNote.issued_by['doctor_email'])
        progressNote.issued_by['doctor_telephone']  = aes.decrypt(progressNote.issued_by['doctor_telephone'])

        const medicalRecord = await this. medicalRecordService.getMedicalRecordByID(progressNote.medicalRecord.toString())

        if(user.role == Role.Admin || medicalRecord.recipients.includes( aes.encrypt(user.email) ) || progressNote.patient_demographics.email == user.email) {
            return progressNote
        }
        else {
            throw new HttpException('Forbidden action, as you are not authorized to access resource. If you are a medical provider, request read access to medical record tied to this progress note', HttpStatus.FORBIDDEN)
        }
    }


    async updateProgressNoteByID() {

    }

    async getProgressNotesOfLoggedInPatient( user: User) {
        const progressNotes = await this.progressNoteModel.find({'patient_demographics.email': aes.encrypt(user.email)}).exec()
        if(!progressNotes.length) { throw new NotFoundException("Progress notes not found.") }

        const decryptedProgressNotes = progressNotes.map( progressNote => {

            const decryptedPatientDemographics = {
                firstName:  aes.decrypt(progressNote.patient_demographics.firstName),
                lastName:   aes.decrypt(progressNote.patient_demographics.lastName),
                email:      aes.decrypt(progressNote.patient_demographics.email),
                age:        progressNote.patient_demographics.age,
                address:    aes.decrypt(progressNote.patient_demographics.address),
                telephone:  aes.decrypt(progressNote.patient_demographics.telephone)
            }

            const decryptedSubjectiveInformation = progressNote.subjectiveInformation == undefined ? null : aes.decrypt(progressNote.subjectiveInformation)
            const decryptedObjectiveInformation  = progressNote.objectiveInformation  == undefined ? null : aes.decrypt(progressNote.objectiveInformation)
            const decryptedAssessment            = progressNote.assessment            == undefined ? null : aes.decrypt(progressNote.assessment)
            const decryptedPlan                  = progressNote.plan                  == undefined ? null : aes.decrypt(progressNote.plan)
            const decryptedProgress              = aes.decrypt(progressNote.progress) // the elvis operator is not used here because it can't be without a value when creating a progress note

            const decryptedIssuedBy = {
                doctor_firstName:  aes.decrypt(progressNote.issued_by['doctor_firstName']),
                doctor_lastName:   aes.decrypt(progressNote.issued_by['doctor_lastName']),
                doctor_department: aes.decrypt(progressNote.issued_by['doctor_department']),
                doctor_email:      aes.decrypt(progressNote.issued_by['doctor_email']),
                doctor_telephone:  aes.decrypt(progressNote.issued_by['doctor_telephone']),
            }

            return {
                _id:                   progressNote._id.toString(),
                medicalRecord:         progressNote.medicalRecord['_id'],
                patientDemographics:   decryptedPatientDemographics,
                subjectiveInformation: decryptedSubjectiveInformation,
                objectiveInformation:  decryptedObjectiveInformation,
                assessment:            decryptedAssessment,
                plan:                  decryptedPlan,
                progress:              decryptedProgress,
                issuedBy:              decryptedIssuedBy
            }

        } )

        return decryptedProgressNotes
    }


    async deleteProgressNoteByID() {

    }


    async deleteAllProgressNotes() {

    }

}
