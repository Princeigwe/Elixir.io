import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import {Model} from 'mongoose'
import {InjectModel} from '@nestjs/mongoose'
import {MedicalDepartment, MedicalDepartmentDocument} from './medical-departments.schema'

// AVAILABLE DEPARTMENTS = - Cardiology
// - Dermatology 
// - Urology
// - IntensiveCareMedicine
// - Neurology
// - Surgery
// - Radiology
// - Pharmacy

@Injectable()
export class MedicalDepartmentsService {
    constructor( @InjectModel(MedicalDepartment.name) private medicalDepartmentModel: Model<MedicalDepartmentDocument> ) {}

    // this action will only be executed by the admin
    async createMedicalDepartment(name: string) {
        const existingMedicalDepartment = await this.medicalDepartmentModel.findOne({name: name}).exec()
        if (existingMedicalDepartment) {
            throw new HttpException('Medical department already exists, create with a different name', HttpStatus.BAD_REQUEST) 
        }
        const medicalDepartment = new this.medicalDepartmentModel({name: name})
        return medicalDepartment.save()
    }

    async getMedicalDepartments() {}

    async getMedicalDepartmentByName() {}

    // this will be executed by an event when a new consultant is registered
    async createGroupInDepartment() {}

    // this will be executed by an event, the doctor's full name will be added to the list of members in the department
    async addToMembersOfGroup() {}

    // this action will only be executed by the admin
    async editMemberOfGroupByName() {}

    async addToMembersOfDepartment() {}

    async removeFromMembersOfMedicalDepartment() {}

    // this action will only be executed by the admin
    async deleteMedicalDepartment() {}
}
