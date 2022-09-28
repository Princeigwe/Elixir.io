import { Injectable, NotFoundException, HttpException, HttpStatus } from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose'
import {Model} from 'mongoose'
import {Doctor, DoctorDocument} from '../schemas/doctor.schema'
import {NewUserEvent} from '../../events/createProfileByUser.event'
import {OnEvent} from '@nestjs/event-emitter'
import {NewMedicalProviderEvent} from '../../events/createMedicalProviderProfile.event'
import {MedicalDepartments} from '../../enums/medical.department.enum'
import {DoctorHierarchy} from '../../enums/doctor.hierarchy.enum'
import {UsersService} from '../../users/users.service'
import { EventEmitter2 } from '@nestjs/event-emitter';
import { RemoveDoctorEvent } from '../../events/removeDoctorFromDepartment.event';

import {CaslAbilityFactory} from '../../casl/casl-ability.factory'
import {User} from '../../users/users.schema'
import {Action} from '../../enums/action.enum'
import {S3} from 'aws-sdk'



@Injectable()
export class DoctorService {
    constructor(
        @InjectModel(Doctor.name) private doctorModel: Model<DoctorDocument>,
        private usersService: UsersService,
        private eventEmitter: EventEmitter2,
        private caslAbilityFactory: CaslAbilityFactory
    ) {}

    /**
     * It creates a new doctor profile and saves it to the database
     * @param {NewMedicalProviderEvent} payload - NewMedicalProviderEvent
     * @returns The doctor object is being returned.
     */
    @OnEvent('new.user.medic')
    async createDoctorProfile(payload: NewMedicalProviderEvent) {
        const doctor = new this.doctorModel({
            user: payload.user, 
            firstName: payload.firstName, 
            lastName: payload.lastName, 
            email: payload.email,
            hierarchy: payload.hierarchy, 
            department: payload.department
        })
        return doctor.save()
    }

    /**
     * It returns a list of all doctors in the database
     * @returns An array of all the doctors in the database
     */
    async getDoctorProfiles() {
        const doctors  = await this.doctorModel.find().exec()
        if(!doctors.length) {throw new NotFoundException("Doctors Not Found")}
        return doctors
    }

    /**
     * It returns a doctor profile by id
     * @param {string} _id - The id of the doctor you want to get.
     * @returns The doctor object
     */
    async getDoctorProfileById(_id:string) {
        const doctor = await this.doctorModel.findOne({'_id':_id}).exec()
        if (!doctor) {throw new NotFoundException("Doctor Not Found")}
        return doctor
    }

    // this function searches names with regular expressions
    /**
     * It searches for doctors by first name, last name, or both
     * @param {string} [firstName] - The first name of the doctor.
     * @param {string} [lastName] - The last name of the doctor.
     */
    async searchDoctorsByFirstAndLastNames(firstName?:string, lastName?:string) {
        if (firstName) { 
            let doctors = await this.doctorModel.find({'firstName': { "$regex": firstName, "$options": 'i' } }).exec() 
            if(!doctors.length) {throw new NotFoundException("Doctors Not Found")}
            return doctors
        }else if (lastName) {
            let doctors = await this.doctorModel.find({'lastName': { "$regex": lastName, "$options": 'i' } }).exec() 
            if(!doctors.length) {throw new NotFoundException("Doctors Not Found")}
            return doctors
        }

        else if (firstName && lastName) {
            let doctors = await this.doctorModel.find({'firstName': { "$regex": firstName, "$options": 'i' }, 'lastName': { "$regex": lastName, "$options": 'i' } }).exec() 
            if(!doctors.length) {throw new NotFoundException("Doctors Not Found")}
            return doctors
        }

    }


    // this method uploads a file to the Elixir.io bucket
    /**
     * It uploads a file to an S3 bucket
     * @param {Buffer} body - The image file that we want to upload.
     * @param {string} fileName - The name of the file that will be saved in S3.
     * @returns A promise
     */
    async uploadProfileAvatar(body: Buffer, fileName: string) {
        const bucket = process.env.S3_BUCKET

        const s3 = new S3()
        const params = {Bucket: bucket, Key: fileName, Body: body}
        return s3.upload(params).promise()
    }



    /**
     * It deletes a profile avatar from S3
     * @param {string} fileName - The name of the file to be deleted.
     */
    async deleteProfileAvatar(fileName: string) {
        const bucket = process.env.S3_BUCKET

        const s3 = new S3()
        const params = {Bucket: bucket, Key: fileName}
        s3.deleteObject(params).promise()
    }

/**
 * It deletes the old image from s3 and uploads a new one
 * @param {string} email - email of the doctor
 * @param {Buffer} body - Buffer - the image file
 * @param {string} fileName - the name of the file that will be uploaded to s3
 */

    async editDoctorProfileAvatar(email: string, body: Buffer, fileName: string) {
        const doctor = await this.doctorModel.findOne({'email': email})
        // getting the filename from the image url of doctor profile
        const doctorImageFileName = doctor.imageUrl.split('elixir.io/')[1]

        // deleting the image from s3
        await this.deleteProfileAvatar(doctorImageFileName)

        // uploading a new file
        await this.uploadDoctorProfileAvatar(email, body, fileName)
    }


    async uploadDoctorProfileAvatar(email: string, body: Buffer, fileName: string) {

        const imageLocation = await (await this.uploadProfileAvatar(body, fileName)).Location
        await this.doctorModel.updateOne({email: email}, {'imageUrl': imageLocation})

    }

    // doctor profile update with authorization with CASL
    async editBasicDoctorProfileById(_id:string, attrs: Pick<Doctor, 'age' | 'address' | 'telephone' | 'maritalStatus' | 'specialties' | 'certificates' | 'yearsOfExperience' | 'languages' >, user: User) {
        const ability = this.caslAbilityFactory.createForUser(user)

        const doctor = await this.getDoctorProfileById(_id)
        // const doctor = await this.doctorModel.findOne({'_id': _id})

        console.log(ability.can(Action.Update, doctor))

        if( ability.can(Action.Update, doctor) || ability.can(Action.Manage, 'all') ) {
            Object.assign(doctor, attrs)
            return doctor.save()
        }
        else {
            throw new HttpException('Forbidden Resource', HttpStatus.BAD_REQUEST)
        }
    }


    async deleteDoctorsProfiles() {
        await this.doctorModel.deleteMany().exec()
    }


    // this will be used in the medical department service when a doctor cannot be added to a department
    async deleteDoctorByNamesDepartmentAndHierarchy(firstName: string, lastName: string, department: MedicalDepartments, hierarchy: DoctorHierarchy) {

        // this deletes the user model tied to the doctor profile
        const doctor = await this.doctorModel.findOne({'firstName': firstName, 'lastName': lastName, 'department': department, 'hierarchy': hierarchy})
        const doctorUserObjectID = doctor['user']
        console.log(doctorUserObjectID)
        await this.usersService.deleteUserByID(doctorUserObjectID)

        // emitting the data that will be used to delete a member from a department
        this.eventEmitter.emit('remove.doctor', new RemoveDoctorEvent(firstName, lastName, department, hierarchy))

        // deletes doctor profile
        await this.doctorModel.deleteOne({'firstName': firstName, 'lastName': lastName, 'department': department, 'hierarchy': hierarchy})
    }

}
