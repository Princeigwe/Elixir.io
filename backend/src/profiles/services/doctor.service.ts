import { Injectable, NotFoundException } from '@nestjs/common';
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



@Injectable()
export class DoctorService {
    constructor(
        @InjectModel(Doctor.name) private doctorModel: Model<DoctorDocument>,
        private usersService: UsersService,
        private eventEmitter: EventEmitter2
    ) {}

    @OnEvent('new.user.medic')
    async createDoctorProfile(payload: NewMedicalProviderEvent) {
        const doctor = new this.doctorModel({
            user: payload.user, 
            firstName: payload.firstName, 
            lastName: payload.lastName, 
            hierarchy: payload.hierarchy, 
            department: payload.department
        })
        return doctor.save()
    }

    async getDoctorProfiles() {
        const doctors  = await this.doctorModel.find().exec()
        if(!doctors.length) {throw new NotFoundException("Doctors Not Found")}
        return doctors
    }

    async getDoctorProfileById(_id:string) {
        const doctor = await this.doctorModel.findOne({'_id':_id}).exec()
        if (!doctor) {throw new NotFoundException("Doctor Not Found")}
        return doctor
    }

    // this function searches names with regular expressions
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

    
    /* 
        this method will help doctor fill up or edit profile without touching organizational data and user object id
        todo: add CASL authorization to this
    */
    async editBasicDoctorProfileById(_id:string, attrs: Pick<Doctor, 'age' | 'address' | 'telephone' | 'maritalStatus' | 'specialties' | 'certificates' | 'yearsOfExperience' | 'languages' >) {
        const doctor = await this.getDoctorProfileById(_id)
        Object.assign(doctor, attrs)
        return doctor.save()
    }


    async deleteDoctorsProfiles() {
        await this.doctorModel.deleteMany().exec()
    }


    // this deletes the user model tied to the doctor profile
    // this should be executed first before 'this.deleteDoctorByNamesDepartmentAndHierarchy()' method
    // async deleteUserLinkedToDoctorProfile(firstName: string, lastName: string, department: MedicalDepartments, hierarchy: DoctorHierarchy) {
    //     const doctor = await this.doctorModel.findOne({'firstName': firstName, 'lastName': lastName, 'department': department, 'hierarchy': hierarchy})
    //     const doctorUserObjectID = doctor['user']
    //     await this.usersService.deleteUserByID(doctorUserObjectID)
    // }


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
