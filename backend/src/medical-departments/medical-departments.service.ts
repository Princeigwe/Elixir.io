import { Injectable, HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import {Model} from 'mongoose'
import {InjectModel} from '@nestjs/mongoose'
import {MedicalDepartment, MedicalDepartmentDocument} from './medical-departments.schema'
import {OnEvent} from '@nestjs/event-emitter'
import {NewDepartmentConsultantEvent} from '../events/createNewDepartmentGroup.event'
import {MedicalDepartments} from '../enums/medical.department.enum'

// AVAILABLE DEPARTMENTS = 
// - Cardiology
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

    async getMedicalDepartments() {
        const medicalDepartments = await this.medicalDepartmentModel.find().exec()
        if (!medicalDepartments.length) {throw new NotFoundException('There are no medical departments found')}
        return medicalDepartments
    }

    async searchMedicalDepartmentByName(name: string) {
        const medicalDepartment = await this.medicalDepartmentModel.findOne({'name': name}).exec()
        if (!medicalDepartment) {throw new NotFoundException('Medical department with this name does not exist')}
        return medicalDepartment
    }

    // this method finds a department and adds a new doctor to its members
    async addToMembersOfDepartment(department: MedicalDepartments, member: string) {
        await this.medicalDepartmentModel.updateOne( {'name': department}, { $push: { members: member } } )
    }

    /*
        this will be executed by an event when a new consultant is registered
        This searches a department by name provided, and creates a new group with the consultant first and last name data
     */
    @OnEvent('new.consultant')
    async createGroupWithNewConsultantInDepartment(payload: NewDepartmentConsultantEvent) {
        const consultantFirstName = payload.firstName
        const consultantLastName = payload.lastName
        const department = payload.department

        const consultant = `${consultantFirstName} ${consultantLastName}`

        let newGroup = { 
            consultant: consultant,
            associateSpecialists: [], // maximum number of 2
            juniorStudents: [], // maximum number of 4
            medicalStudents: [] // maximum number of 8
        }

        // fetch the a department by the event payload department, and add a group object to the groups array
        await this.medicalDepartmentModel.updateOne({'name': department}, { $push: { groups:  newGroup } })
        await this.addToMembersOfDepartment(department, consultant)
    }

    // this will be executed by an event, the doctor's full name will be added to the list of members in the department
    async addToMembersOfGroup() {}

    async editMemberOfGroupByName() {}

    // this action will only be executed by the admin, when a doctor is fired, or profile is deleted
    async removeFromMembersOfMedicalDepartment() {}

    // this action will only be executed by the admin
    async deleteMedicalDepartments() {
        await this.medicalDepartmentModel.deleteMany()
        return {message: 'Medical departments deleted successfully'}
    }

    // this action will only be executed by the admin
    async searchAndDeleteMedicalDepartmentByName(name: string) {
        const medicalDepartment = await this.medicalDepartmentModel.findOne({'name': name}).exec()
        if (!medicalDepartment) {throw new NotFoundException('This department cannot be deleted because it does not exist')}
        await this.medicalDepartmentModel.deleteOne({'name': name})
        return {message: 'Medical department deleted successfully'}
    }
}
