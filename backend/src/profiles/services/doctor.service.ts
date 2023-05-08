import { Injectable, NotFoundException, HttpException, HttpStatus, Inject, forwardRef } from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose'
import {Model} from 'mongoose'
import {Doctor, DoctorDocument} from '../schemas/doctor.schema'
import {NewUserEvent} from '../../events/createProfileByUser.event'
import {OnEvent} from '@nestjs/event-emitter'
import {NewMedicalProviderEvent} from '../../events/createMedicalProviderProfile.event'
import {MedicalDepartments} from '../../enums/medical.department.enum'
import {DoctorHierarchy} from '../../enums/doctor.hierarchy.enum'
import {UsersService} from '../../users/users.service'
import {MedicalDepartmentsService} from '../../medical-departments/medical-departments.service'
import { EventEmitter2 } from '@nestjs/event-emitter';
import { RemoveDoctorEvent } from '../../events/removeDoctorFromDepartment.event';

import {CaslAbilityFactory} from '../../casl/casl-ability.factory'
import {User} from '../../users/users.schema'
import {Action} from '../../enums/action.enum'
import { S3BucketOperations } from '../../aws/s3.bucket.operations';
import {AssignedPatientToDoctorEvent} from '../../events/assignedPatientToDoctor.event'
import {UpdateTelephoneToConcernedProfilesEvent} from '../../events/updateTelephoneDataToConcernedProfiles.event'


const s3BucketOperations = new S3BucketOperations()



@Injectable()
export class DoctorService {
    constructor(
        @InjectModel(Doctor.name) private doctorModel: Model<DoctorDocument>,
        private usersService: UsersService,
        private eventEmitter: EventEmitter2,
        @Inject(forwardRef(() => MedicalDepartmentsService)) private medicalDepartmentsService: MedicalDepartmentsService,
        private caslAbilityFactory: CaslAbilityFactory,
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
            department: payload.department,
            address: payload.address,
            telephone: payload.telephone
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


    async getDoctorProfileByEmail(email: string) {
        const doctor = await this.doctorModel.findOne({'email': email}).exec()
        if(!doctor) {throw new NotFoundException("Doctor Not Found")}
        return doctor
    }


    async getDoctorProfileByNames(firstName: string, lastName: string) {
        const doctor = await this.doctorModel.findOne({'firstName': firstName, 'lastName': lastName}).exec()
        if(!doctor) {throw new NotFoundException("Doctor Not Found")}
        return doctor
    }


    async getDoctorProfileByNamesAndByDepartment(firstName: string, lastName: string, department: MedicalDepartments, hierarchy) {
        const doctor = await this.doctorModel.findOne({'firstName': firstName, 'lastName': lastName, 'department': department, 'hierarchy': hierarchy}).exec()
        if(!doctor) {throw new NotFoundException("Doctor Not Found")}
        return doctor
    }


    // this method uploads a file to the Elixir.io bucket
    // /**
    //  * It uploads a file to an S3 bucket
    //  * @param {Buffer} body - The image file that we want to upload.
    //  * @param {string} fileName - The name of the file that will be saved in S3.
    //  * @returns A promise
    //  */
    // async uploadProfileAvatar(body: Buffer, fileName: string) {
    //     const bucket = process.env.S3_BUCKET

    //     const s3 = new S3()
    //     const params = {Bucket: bucket, Key: fileName, Body: body}
    //     return s3.upload(params).promise()
    // }



    // /**
    //  * It deletes a profile avatar from S3
    //  * @param {string} fileName - The name of the file to be deleted.
    //  */
    // async deleteProfileAvatar(fileName: string) {
    //     const bucket = process.env.S3_BUCKET

    //     const s3 = new S3()
    //     const params = {Bucket: bucket, Key: fileName}
    //     s3.deleteObject(params).promise()
    // }

/**
 * It deletes the old image from s3 and uploads a new one
 * @param {string} email - email of the doctor
 * @param {Buffer} body - Buffer - the image file
 * @param {string} fileName - the name of the file that will be uploaded to s3
 */

    async editDoctorProfileAvatar(_id: string, body: Buffer, fileName: string, user: User) {
        const doctor = await this.getDoctorProfileById(_id)
        
        // getting the filename from the image url of doctor profile
        const doctorImageFileName = doctor.imageUrl.split('elixir.io/')[1]

        // deleting the image from s3
        await s3BucketOperations.deleteProfileAvatar(doctorImageFileName)

        // uploading a new file
        await this.uploadDoctorProfileAvatar(_id, body, fileName, user)
    }


    @OnEvent('assigned.patient')
    async updateDoctorProfileOnAssignedPatient(payload: AssignedPatientToDoctorEvent) {
        const assignedPatient = {
            imageUrl: payload.imageUrl,
            firstName: payload.firstName,
            lastName: payload.lastName,
            age: payload.age,
            address: payload.address,
            telephone: payload.telephone,
            occupation: payload.occupation,
            maritalStatus: payload.maritalStatus, 
            pharmacyTelephone: payload.pharmacyTelephone
        }
        await this.doctorModel.updateOne({ 'firstName': payload.doctorFirstName, 'lastName': payload.doctorLastName, 'department': payload.medicalDepartment}, {$addToSet: { 'assignedPatients': assignedPatient }})
    }


    @OnEvent('remove.assigned.patient')
    async updateDoctorProfileOnRemovedAssignedPatient(payload: AssignedPatientToDoctorEvent) {
        const assignedPatient = {
            imageUrl: payload.imageUrl,
            firstName: payload.firstName,
            lastName: payload.lastName,
            age: payload.age,
            address: payload.address,
            telephone: payload.telephone,
            occupation: payload.occupation,
            maritalStatus: payload.maritalStatus, 
            pharmacyTelephone: payload.pharmacyTelephone
        }

        await this.doctorModel.updateOne({ 'firstName': payload.doctorFirstName, 'lastName': payload.doctorLastName, 'department': payload.medicalDepartment}, {$pull: { 'assignedPatients': assignedPatient }})

    }


    async uploadDoctorProfileAvatar(_id: string, body: Buffer, fileName: string, user: User) {

        const ability = this.caslAbilityFactory.createForUser(user)

        const doctor = await this.getDoctorProfileById(_id)
        const imageLocation = await (await s3BucketOperations.uploadProfileAvatar(body, fileName)).Location

        if (ability.can(Action.Update, doctor) || ability.can(Action.Manage, 'all')) {
            await this.doctorModel.updateOne({'_id': _id}, {'imageUrl': imageLocation})
        }
        else {
            throw new HttpException('Forbidden Resource', HttpStatus.BAD_REQUEST)
        }

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


    async editBasicDoctorProfileOfLoggedInUser(attrs: Pick<Doctor, 'age' | 'address' | 'telephone' | 'maritalStatus' | 'specialties' | 'certificates' | 'yearsOfExperience' | 'languages' >, user: User) {
        const ability = this.caslAbilityFactory.createForUser(user)

        const doctor = await this.getDoctorProfileByEmail(user.email)
        // const doctor = await this.doctorModel.findOne({'_id': _id})

        console.log(ability.can(Action.Update, doctor))

        if( ability.can(Action.Update, doctor) || ability.can(Action.Manage, 'all') ) {
            Object.assign(doctor, attrs)
            this.eventEmitter.emit('updated.doctor.telephone', new UpdateTelephoneToConcernedProfilesEvent(doctor.email, doctor.telephone))
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
    async deleteDoctorByNamesEmailDepartmentAndHierarchy(firstName: string, lastName: string, email: string, department: MedicalDepartments, hierarchy: DoctorHierarchy) {

        // this deletes the user model tied to the doctor profile
        const doctor = await this.doctorModel.findOne({'firstName': firstName, 'lastName': lastName, 'email': email, 'department': department, 'hierarchy': hierarchy})
        const doctorUserObjectID = doctor['user']
        console.log(doctorUserObjectID)
        await this.usersService.deleteUserByID(doctorUserObjectID)

        // emitting the data that will be used to delete a member from a department
        this.eventEmitter.emit('remove.doctor', new RemoveDoctorEvent(firstName, lastName, department, hierarchy))


        // deleting the doctor's profile avatar(if there's any) from elixir.io s3 bucket
        if(doctor.imageUrl) {
            const doctorImageFileName = doctor.imageUrl.split('elixir.io/')[1]
            await s3BucketOperations.deleteProfileAvatar(doctorImageFileName)
        }

        // deletes doctor profile
        await this.doctorModel.deleteOne({'firstName': firstName, 'lastName': lastName, 'email': email, 'department': department, 'hierarchy': hierarchy})
    }


    // this action will only be executed by an admin
    async promoteDoctorHierarchy(firstName: string, lastName: string, email: string,  department: MedicalDepartments) {
        const doctor = await this.doctorModel.findOne({'firstName': firstName, 'lastName': lastName, 'department': department }).exec() 
        if(!doctor) {throw new NotFoundException("Doctor Not Found")}

        else if(doctor.hierarchy == DoctorHierarchy.MedicalStudent) {
            await this.doctorModel.updateOne({'firstName': firstName, 'lastName': lastName, 'department': department }, {$set: {'hierarchy': DoctorHierarchy.JuniorDoctor}})
            await this.medicalDepartmentsService.promoteMedicalStudentToJuniorDoctorInDepartment(firstName, lastName, email, department)
            let updatedDoctor = await this.doctorModel.findOne({'firstName': { "$regex": firstName, "$options": 'i' }, 'lastName': { "$regex": lastName, "$options": 'i' }, 'email': { "$regex": email, "$options": 'i' }, 'department': { "$regex": department, "$options": 'i' } }).exec()
            return updatedDoctor
        }

        else if(doctor.hierarchy == DoctorHierarchy.JuniorDoctor) {
            await this.doctorModel.updateOne({'firstName': firstName, 'lastName': lastName, 'department': department }, {$set: {'hierarchy': DoctorHierarchy.AssociateSpecialist}})
            await this.medicalDepartmentsService.promoteJuniorDoctorToAssociateSpecialistInDepartment(firstName, lastName, email, department)
            let updatedDoctor = await this.doctorModel.findOne({'firstName': { "$regex": firstName, "$options": 'i' }, 'lastName': { "$regex": lastName, "$options": 'i' }, 'email': { "$regex": email, "$options": 'i' }, 'department': { "$regex": department, "$options": 'i' } }).exec()
            return updatedDoctor
        }

        else if(doctor.hierarchy == DoctorHierarchy.AssociateSpecialist) {
            await this.doctorModel.updateOne({'firstName': firstName, 'lastName': lastName, 'department': department }, {$set: {'hierarchy': DoctorHierarchy.Consultant}})
            await this.medicalDepartmentsService.promoteAssociateSpecialistToConsultantInDepartment(firstName, lastName, department)
            let updatedDoctor = await this.doctorModel.findOne({'firstName': { "$regex": firstName, "$options": 'i' }, 'lastName': { "$regex": lastName, "$options": 'i' }, 'department': { "$regex": department, "$options": 'i' } }).exec()
            return updatedDoctor
        }

        else {
            throw new HttpException('Consultant hierarchy cannot be promoted any further', HttpStatus.BAD_REQUEST)
        }
    }


    // this action will be executed by the admin, in case of an error in promotion
    async demoteDoctorHierarchy(firstName: string, lastName: string, email: string, department: MedicalDepartments) {
        const doctor = await this.doctorModel.findOne({'firstName': { "$regex": firstName, "$options": 'i' }, 'lastName': { "$regex": lastName, "$options": 'i' }, 'department': { "$regex": department, "$options": 'i' } }).exec() 
        if(!doctor) {throw new NotFoundException("Doctor Not Found")}

        else if(doctor.hierarchy == DoctorHierarchy.Consultant) {
            await this.doctorModel.updateOne({'firstName': firstName, 'lastName': lastName, 'department': department }, {$set: {'hierarchy': DoctorHierarchy.AssociateSpecialist}})
            await this.medicalDepartmentsService.demoteConsultantToAssociateSpecialistInDepartment(firstName, lastName, email, department)
            let updatedDoctor = await this.doctorModel.findOne({'firstName': { "$regex": firstName, "$options": 'i' }, 'lastName': { "$regex": lastName, "$options": 'i' }, 'email': { "$regex": email, "$options": 'i' }, 'department': { "$regex": department, "$options": 'i' } }).exec()
            return updatedDoctor
        }

        else if(doctor.hierarchy == DoctorHierarchy.AssociateSpecialist) {
            await this.doctorModel.updateOne({'firstName': firstName, 'lastName': lastName, 'department': department}, {$set: {'hierarchy': DoctorHierarchy.JuniorDoctor}})
            await this.medicalDepartmentsService.demoteAssociateSpecialistToJuniorDoctorInDepartment(firstName, lastName, email, department)
            let updatedDoctor = await this.doctorModel.findOne({'firstName': { "$regex": firstName, "$options": 'i' }, 'lastName': { "$regex": lastName, "$options": 'i' }, 'email': { "$regex": email, "$options": 'i' }, 'department': { "$regex": department, "$options": 'i' } }).exec()
            return updatedDoctor
        }

        else if(doctor.hierarchy == DoctorHierarchy.JuniorDoctor) {
            await this.doctorModel.updateOne({'firstName': firstName, 'lastName': lastName, 'department': department }, {$set: {'hierarchy': DoctorHierarchy.MedicalStudent}})
            await this.medicalDepartmentsService.demoteJuniorDoctorToMedicalStudentInDepartment(firstName, lastName, email, department)
            let updatedDoctor = await this.doctorModel.findOne({'firstName': { "$regex": firstName, "$options": 'i' }, 'lastName': { "$regex": lastName, "$options": 'i' }, 'email': { "$regex": email, "$options": 'i' }, 'department': { "$regex": department, "$options": 'i' } }).exec()
            return updatedDoctor
        }

        else {
            throw new HttpException('Medical Student hierarchy cannot be demoted any further', HttpStatus.BAD_REQUEST)
        }
    }


    @OnEvent('updated.patient.telephone')
    async updatePatientTelephonePatientsArrayOfDoctorProfile(payload: UpdateTelephoneToConcernedProfilesEvent) {

    }
}
