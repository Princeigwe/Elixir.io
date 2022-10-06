import { Injectable, NotFoundException, HttpException, HttpStatus } from '@nestjs/common';
import {Model} from 'mongoose'
import { InjectModel } from '@nestjs/mongoose';
import {Patient, PatientDocument} from '../schemas/patient.schema'
import {OnEvent} from '@nestjs/event-emitter'
import {NewUserEvent} from '../../events/createProfileByUser.event'
import { S3BucketOperations } from '../../aws/s3.bucket.operations';
import {CaslAbilityFactory} from '../../casl/casl-ability.factory'
import {User} from '../../users/users.schema'
import {Action} from '../../enums/action.enum'

const s3BucketOperations = new S3BucketOperations()


@Injectable()
export class PatientService {
    constructor(
        @InjectModel(Patient.name) private patientModel: Model<PatientDocument>,
        private caslAbilityFactory: CaslAbilityFactory,
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

    // this action will be executed by any doctor in charge
    async assignSubordinateDoctorToPatient() {}

    async editAssignedSubordinateDoctorToPatient() {}

    async deletePatientsProfiles() {
        await this.patientModel.deleteMany().exec()
        // return {message: 'Patients profiles deleted'}
        throw new HttpException('Patients profiles Deleted', HttpStatus.NO_CONTENT) 
    }

}
