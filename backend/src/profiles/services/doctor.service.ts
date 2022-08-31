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
}
