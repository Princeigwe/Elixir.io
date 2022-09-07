import { Injectable, HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import {Model} from 'mongoose'
import {InjectModel} from '@nestjs/mongoose'
import {MedicalDepartment, MedicalDepartmentDocument} from './medical-departments.schema'
import {OnEvent} from '@nestjs/event-emitter'
import {NewDepartmentConsultantEvent} from '../events/createNewDepartmentGroup.event'
import {MedicalDepartments} from '../enums/medical.department.enum'
import {DoctorHierarchy} from '../enums/doctor.hierarchy.enum'
import {NewMedicalDepartmentDoctorEvent} from '../events/addDoctorToDepartmentGroup.event'

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

    // todo: add regex search function to this
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


    // this will be executed by an event, the doctor's full name will be added to the list of members in the department, and assigned to a hierarchy
    @OnEvent('new.doctor')
    async addToHierarchyOfGroupsAndMembersOfDepartment( payload: NewMedicalDepartmentDoctorEvent) {
        const firstName = payload.firstName
        const lastName = payload.lastName
        const department = payload.department
        let hierarchy = payload.hierarchy // ** hierarchy may be undefined if not specified according to 'registerDoctorToADepartment()' of auth.controller.ts **

        if (hierarchy == undefined) {
            hierarchy = DoctorHierarchy.AssociateSpecialist
        }

        // return object with only groups key value
        let departmentGroups = await this.medicalDepartmentModel.findOne({'department': department}, {'groups': 1})

        let doctorNames = `${firstName} ${lastName}`

        console.log(`New doctor added with ${doctorNames}, ${department}, ${hierarchy}`)
        console.log(departmentGroups)


        if(hierarchy != DoctorHierarchy.Consultant){ 
            console.log(departmentGroups)
            if(departmentGroups["groups"].length == 0) {
                const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))
                await sleep(120000) // sleep for 2 minutes before notifying the related parties

                //todo: this should be replaced with an email service, Nodemailer or AWS email service, notifying the admin officers and the user that just registered
                console.log('An associate specialist can no longer be accepted as of this time.')
            }
            else {
                
            }
        }

        // if(hierarchy == DoctorHierarchy.AssociateSpecialist) { 
        //     if( departmentGroups["associateSpecialists"].length < 2 ){
        //         await this.medicalDepartmentModel.updateOne({ 'name': department }, { $push: { 'groups.$.associateSpecialists': doctorNames } })
        //     }
            
        //     else {
        //         throw new HttpException('An associate specialist can no longer be accepted as of this time.', HttpStatus.BAD_REQUEST)
        //     }
        // }
    }

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
