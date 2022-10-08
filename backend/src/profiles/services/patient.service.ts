import { Injectable, NotFoundException, HttpException, HttpStatus, Inject, forwardRef } from '@nestjs/common';
import {Model} from 'mongoose'
import { InjectModel } from '@nestjs/mongoose';
import {Patient, PatientDocument} from '../schemas/patient.schema'
import {OnEvent} from '@nestjs/event-emitter'
import {NewUserEvent} from '../../events/createProfileByUser.event'
import { S3BucketOperations } from '../../aws/s3.bucket.operations';
import {CaslAbilityFactory} from '../../casl/casl-ability.factory'
import {User} from '../../users/users.schema'
import {Action} from '../../enums/action.enum'
import {UserCategory} from '../../enums/user.category.enum'
import {DoctorService} from './doctor.service'
import {DoctorHierarchy} from '../../enums/doctor.hierarchy.enum'
import {MedicalDepartmentsService} from '../../medical-departments/medical-departments.service'
import { EventEmitter2 } from '@nestjs/event-emitter';
import {AssignedPatientToDoctorEvent} from '../../events/assignedPatientToDoctor.event'


const s3BucketOperations = new S3BucketOperations()


@Injectable()
export class PatientService {
    constructor(
        @InjectModel(Patient.name) private patientModel: Model<PatientDocument>,
        private caslAbilityFactory: CaslAbilityFactory,
        private doctorService: DoctorService,
        private eventEmitter: EventEmitter2,
        @Inject(forwardRef(() => MedicalDepartmentsService)) private medicalDepartmentsService: MedicalDepartmentsService,
    ) {}

    @OnEvent('new.user')
    async createPatientProfile(payload: NewUserEvent) {
        const patient = new this.patientModel({user: payload.user, email: payload.email})
        return patient.save()
    }

    async getPatientProfiles() {
        const patients =  await this.patientModel.find().exec()
        if(!patients.length) {throw new NotFoundException("Patients Not Found")}
        return patients
    }

    async getPatientProfileById(_id: string) {
        const patient = await this.patientModel.findOne({'_id': _id}).exec()
        if (!patient) {throw new NotFoundException("Patient Not Found")}
        return patient
    }



    async uploadPatientProfileAvatar(_id: string, body: Buffer, fileName: string, user: User) {
        const ability = this.caslAbilityFactory.createForUser(user)

        const patient = await this.getPatientProfileById(_id)
        const imageLocation = await (await s3BucketOperations.uploadProfileAvatar(body, fileName)).Location

        if (ability.can(Action.Update, patient) || ability.can(Action.Manage, 'all')) {
            await this.patientModel.updateOne({'_id': _id}, {'imageUrl': imageLocation})
        }
        else {
            throw new HttpException('Forbidden Resource', HttpStatus.BAD_REQUEST)
        }
    } 


    async editPatientProfileAvatar(_id: string, body: Buffer, fileName: string, user: User) {
        const patient = await this.getPatientProfileById(_id)
        
        const patientImageFileName = patient.imageUrl.split('elixir.io/')[1]

        await s3BucketOperations.deleteProfileAvatar(patientImageFileName)

        await this.uploadPatientProfileAvatar(_id, body, fileName, user)
    }



    // this method will help patient fill up or edit profile without touching medical details and user object id
    async editBasicPatientProfileById(_id: string, attrs: Pick<Patient, 'firstName' | 'lastName' | 'age' | 'address' | 'telephone' | 'occupation' | 'maritalStatus'>,user: User) {
        const ability = this.caslAbilityFactory.createForUser(user)

        const patient = await this.getPatientProfileById(_id)
        if( ability.can(Action.Update, patient) || ability.can(Action.Manage, 'all') ) {
            Object.assign(patient, attrs)
            return patient.save()
        }
        else {
            throw new HttpException('Forbidden Resource', HttpStatus.BAD_REQUEST)
        }
    }

    // this method will only be executed by a medical provider
    async addToPatientPrescriptionById(id: string) {}

    // this method will only be executed by a medical provider
    async editPatientPrescriptionById() {}

    /* 
        this action will be executed by a consultant after they are referred to a patient after admission.
        the consultant assigns the patient to a subordinate doctor
    */
    async assignSubordinateDoctorToPatient(user: User, patientId: string, subDoctorFirstName: string, subDoctorLastName: string) {
        if(user.category != UserCategory.MedicalProvider) {
            throw new HttpException('Forbidden action, as you are not a medical provider', HttpStatus.FORBIDDEN)
        }

        // getting the profile logged in consultant
        const doctor = await this.doctorService.getDoctorProfileByEmail(user.email)
        if(doctor.hierarchy != DoctorHierarchy.Consultant) {
            throw new HttpException('Forbidden action, as you are not a consultant', HttpStatus.FORBIDDEN)
        }

        // getting the department the logged in consultant belongs to
        const departmentOfConsultant = await this.medicalDepartmentsService.searchMedicalDepartmentByName(doctor.department)
        
        const subDoctorFullNames = `${subDoctorFirstName} ${subDoctorLastName}`
        if( !departmentOfConsultant['members'].includes(subDoctorFullNames) ) {
            throw new HttpException( `${subDoctorFullNames} is not a member of ${doctor.department} department`, HttpStatus.BAD_REQUEST )
        }

        // getting the profile of the subordinate doctor that will be assigned to the patient 
        const subordinateDoctor = await this.doctorService.getDoctorProfileByNames(subDoctorFirstName, subDoctorLastName)

        await this.patientModel.updateOne({'_id': patientId}, {$set: { 'doctorName': subDoctorFullNames, 'doctorTelephone': subordinateDoctor.telephone, 'doctorAddress': subordinateDoctor.address}})

        const updatedPatientProfile = await this.getPatientProfileById(patientId)
        
        this.eventEmitter.emit(
            'assigned.patient', 
            new AssignedPatientToDoctorEvent(
                doctor.department, 
                subDoctorFirstName,
                subDoctorLastName,

                updatedPatientProfile.imageUrl,
                updatedPatientProfile.firstName,
                updatedPatientProfile.lastName,
                updatedPatientProfile.age,
                updatedPatientProfile.address,
                updatedPatientProfile.telephone,
                updatedPatientProfile.occupation,
                updatedPatientProfile.maritalStatus,
                updatedPatientProfile.medicalIssues,
                updatedPatientProfile.prescriptions,
                updatedPatientProfile.pharmacyTelephone
            )
        )
        return updatedPatientProfile
    }


    async removeAssignedPatientFromSubordinateDoctor(user: User, patientId: string, subDoctorFirstName: string, subDoctorLastName: string) {
        if(user.category != UserCategory.MedicalProvider) {
            throw new HttpException('Forbidden action, as you are not a medical provider', HttpStatus.FORBIDDEN)
        }

        // getting the profile logged in consultant
        const doctor = await this.doctorService.getDoctorProfileByEmail(user.email)
        if(doctor.hierarchy != DoctorHierarchy.Consultant) {
            throw new HttpException('Forbidden action, as you are not a consultant', HttpStatus.FORBIDDEN)
        }

        const departmentOfConsultant = await this.medicalDepartmentsService.searchMedicalDepartmentByName(doctor.department)
        
        const subDoctorFullNames = `${subDoctorFirstName} ${subDoctorLastName}`
        if( !departmentOfConsultant['members'].includes(subDoctorFullNames) ) {
            throw new HttpException( `${subDoctorFullNames} is not a member of ${doctor.department} department`, HttpStatus.BAD_REQUEST )
        }
        
        // removing the assigned subordinate doctor from the patient's profile
        await this.patientModel.updateOne({'_id': patientId}, {$set: { 'doctorName': "", 'doctorTelephone': "", 'doctorAddress': ""}})

        const updatedPatientProfile = await this.getPatientProfileById(patientId)

        this.eventEmitter.emit(
            'remove.assigned.patient', 
            new AssignedPatientToDoctorEvent(
                doctor.department, 
                subDoctorFirstName,
                subDoctorLastName,

                updatedPatientProfile.imageUrl,
                updatedPatientProfile.firstName,
                updatedPatientProfile.lastName,
                updatedPatientProfile.age,
                updatedPatientProfile.address,
                updatedPatientProfile.telephone,
                updatedPatientProfile.occupation,
                updatedPatientProfile.maritalStatus,
                updatedPatientProfile.medicalIssues,
                updatedPatientProfile.prescriptions,
                updatedPatientProfile.pharmacyTelephone
            )
        )

        return updatedPatientProfile

    }

    async editAssignedSubordinateDoctorToPatient() {}

    async deletePatientsProfiles() {
        await this.patientModel.deleteMany().exec()
        // return {message: 'Patients profiles deleted'}
        throw new HttpException('Patients profiles Deleted', HttpStatus.NO_CONTENT) 
    }

}
