import { Injectable, NotFoundException } from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose'
import {Model} from 'mongoose'
import {Doctor, DoctorDocument} from '../schemas/doctor.schema'
import {NewUserEvent} from '../../events/createProfileByUser.event'
import {OnEvent} from '@nestjs/event-emitter'



@Injectable()
export class DoctorService {
    constructor(@InjectModel(Doctor.name) private doctorModel: Model<DoctorDocument>) {}

    @OnEvent('new.user')
    async createPatientProfile(payload: NewUserEvent) {
        const doctor = new this.doctorModel({user: payload.user})
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

    // this method will help doctor fill up or edit profile without touching organizational data and user object id
    async editBasicDoctorProfileById(_id:string, attrs: Pick<Doctor, 'firstName' | 'lastName' | 'age' | 'address' | 'telephone' | 'maritalStatus' | 'specialties' | 'certificates' | 'yearsOfExperience' | 'languages' >) {
        const doctor = await this.getDoctorProfileById(_id)
        Object.assign(doctor, attrs)
        return doctor.save()
    }

    // this action will be executed by the admin
    async assignADirectingDoctorToDoctor() {}

    async deleteDoctorsProfiles() {
        await this.doctorModel.deleteMany().exec()
    }
}
