import { Injectable, HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import {Model} from 'mongoose'
import {InjectModel} from '@nestjs/mongoose'
import {MedicalDepartment, MedicalDepartmentDocument} from './medical-departments.schema'
import {OnEvent} from '@nestjs/event-emitter'
import {NewDepartmentConsultantEvent} from '../events/createNewDepartmentGroup.event'
import {MedicalDepartments} from '../enums/medical.department.enum'
import {DoctorHierarchy} from '../enums/doctor.hierarchy.enum'
import {NewMedicalDepartmentDoctorEvent} from '../events/addDoctorToDepartmentGroup.event'
import * as _ from 'lodash'
import {DoctorService} from '../profiles/services/doctor.service'
import { RemoveDoctorEvent } from '../events/removeDoctorFromDepartment.event';


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
    constructor( 
        @InjectModel(MedicalDepartment.name) private medicalDepartmentModel: Model<MedicalDepartmentDocument>,
        private doctorService: DoctorService
    ) {}

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

    // this function searches name with regular expressions
    async searchMedicalDepartmentByName(name: string) {
        const medicalDepartment = await this.medicalDepartmentModel.findOne({'name': {"$regex": name, "$options": 'i'}}).exec()
        if (!medicalDepartment) {throw new NotFoundException('Medical department with this name does not exist')}
        return medicalDepartment
    }


    // this function will be used in the auth service to register a consultant to a department in the auth service
    async getMedicalDepartmentByName(name: string) {
        return await this.medicalDepartmentModel.findOne({'name': name})
    }

    // this method finds a department and adds a new doctor to its members
    async addToMembersOfDepartment(department: MedicalDepartments, member: string) {
        await this.medicalDepartmentModel.updateOne( {'name': department}, { $push: { members: member } } )
    }


    async replaceVacantConsultantSpace(firstName: string, lastName: string, department: MedicalDepartments) {
        let doctorDepartment = await this.medicalDepartmentModel.findOne({'name': department}).exec()

        const consultant = `${firstName} ${lastName}`

        for(let group of doctorDepartment['groups']) {
            let groupIndex = doctorDepartment['groups'].indexOf(group) // getting the index value of each iterated group
            if (group['consultant'] == "") {
                await this.medicalDepartmentModel.updateOne({'name': department}, { $set: { ['groups.' + groupIndex +'.consultant'] : consultant }} )
                break
            }
        }
        await this.addToMembersOfDepartment(department, consultant)
    }


    /*
        this method will be executed by an event when a consultant is registered to a department
        if the department already have a group, it checks for a vacant consultant space and fills it up with the consultant names,
        else it creates a new group
    */
    @OnEvent('new.consultant')
    async createGroupWithNewConsultantOrReplaceConsultantInDepartment(payload: NewDepartmentConsultantEvent) {
        const consultantFirstName = payload.firstName
        const consultantLastName = payload.lastName
        const department = payload.department

        const consultant = `${consultantFirstName} ${consultantLastName}`

        let doctorDepartment = await this.medicalDepartmentModel.findOne({'name': department}).exec()

        if (doctorDepartment['groups'].length == 0) {
            let newGroup = { 
                consultant: consultant,
                associateSpecialists: [], // maximum number of 2
                juniorDoctors: [], // maximum number of 4
                medicalStudents: [] // maximum number of 8
            }
    
            // fetch the a department by the event payload department, and add a group object to the groups array
            await this.medicalDepartmentModel.updateOne({'name': department}, { $push: { groups:  newGroup } })
            await this.addToMembersOfDepartment(department, consultant)
        }

        else { 
            await this.replaceVacantConsultantSpace(consultantFirstName, consultantLastName, department)
        }

    }


    // function to add an associate specialist to a group in a specified department
    async addAssociateSpecialistToADepartmentGroup(firstName: string, lastName: string, department: MedicalDepartments) {
        /**
         * this function gets the department the doctor specified during registration.
         * it checks if there is a group available in that department.
         * if there is a group in the department, the name of the doctor will be added to the associate specialist hierarchy of that department
         */

        let doctorDepartment = await this.medicalDepartmentModel.findOne({'name': department}).exec()

        let doctorNames = `${firstName} ${lastName}`    
        let lastGroupOfDepartmentGroups = doctorDepartment['groups'][doctorDepartment['groups'].length - 1] // getting the last group item of groups
        let lengthOfLastAssociateSpecialistsArrayInLastGroup = _.size(lastGroupOfDepartmentGroups['associateSpecialists'])  // getting the length of the last associateSpecialists array in the last group with lodash
        
        /*
            if the roles for associate specialists in a department are filled up,
            fetch the newly created doctor profile with the firstName and lastName, with the specified department and hierarchy,
            and delete it, along with the user associated to the profile.
        */
        if(lengthOfLastAssociateSpecialistsArrayInLastGroup == 2) { // 2 here is the maximum number of items the associateSpecialists array can take
            let hierarchy = DoctorHierarchy.AssociateSpecialist
            // await this.doctorService.deleteUserLinkedToDoctorProfile(firstName, lastName, department, hierarchy)
            await this.doctorService.deleteDoctorByNamesDepartmentAndHierarchy(firstName, lastName, department, hierarchy)
            //todo: this should be replaced with an email service, Nodemailer or AWS email service, notifying the admin officers and the user that just registered
            console.log("No available space to add a new associate specialist")
        }
        
        else{
            for (let group of doctorDepartment['groups']) {
                if( _.size(group['associateSpecialists']) < 2 ){ // only 2 associate specialists are allowed per group
                    let groupIndex = doctorDepartment['groups'].indexOf(group) // getting the index value of each iterated group
                    await this.medicalDepartmentModel.updateOne({'name': department}, { $push:  { ['groups.' + groupIndex +'.associateSpecialists'] : doctorNames }  }) // updating nested array of associate specialist per group item with doctor's names
                    break
                }
            }

            // add to members array of department
            await this.addToMembersOfDepartment(department, doctorNames)
        }
    }


    // function to add a junior doctor to a group in a specified department
    async addJuniorDoctorToADepartmentGroup(firstName: string, lastName: string, department: MedicalDepartments) {
        /**
         * this function gets the department the doctor specified during registration.
         * it checks if there is a group available in that department.
         * if there is a group in the department, the name of the doctor will be added to the junior doctor hierarchy of that department
         */

        let doctorDepartment = await this.medicalDepartmentModel.findOne({'name': department}).exec()
        let doctorNames = `${firstName} ${lastName}`    
        let lastGroupOfDepartmentGroups = doctorDepartment['groups'][doctorDepartment['groups'].length - 1] // getting the last group item of groups
        let lengthOfLastJuniorDoctorsArrayInLastGroup = _.size(lastGroupOfDepartmentGroups['juniorDoctors'])  // getting the length of the last juniorDoctors array in the last group with lodash
        
        /*
            if the roles for junior doctors in a department are filled up,
            fetch the newly created doctor profile with the firstName and lastName, with the specified department and hierarchy,
            and delete it, along with the user associated to the profile.
        */
        if(lengthOfLastJuniorDoctorsArrayInLastGroup == 4) { // 4 here is the maximum number of items the juniorDoctors array can take
            let hierarchy = DoctorHierarchy.JuniorDoctor
            // await this.doctorService.deleteUserLinkedToDoctorProfile(firstName, lastName, department, hierarchy)
            await this.doctorService.deleteDoctorByNamesDepartmentAndHierarchy(firstName, lastName, department, hierarchy)
            //todo: this should be replaced with an email service, Nodemailer or AWS email service, notifying the admin officers and the user that just registered
            console.log("No available space to add a new junior doctor")
        }

        else{
            for (let group of doctorDepartment['groups']) {
                if( _.size(group['juniorDoctors']) < 4 ){ // only 4 junior students are allowed per group
                    let groupIndex = doctorDepartment['groups'].indexOf(group) // getting the index value of each iterated group
                    await this.medicalDepartmentModel.updateOne({'name': department}, { $push:  { ['groups.' + groupIndex +'.juniorDoctors'] : doctorNames }  }) // updating nested array of junior doctor per group item with doctor's names
                    break
                }
            }

            // add to members array of department
            await this.addToMembersOfDepartment(department, doctorNames)
        }
    }


    async addMedicalStudentToADepartmentGroup(firstName: string, lastName: string, department: MedicalDepartments) {
        /**
         * this function gets the department the doctor specified during registration.
         * it checks if there is a group available in that department.
         * if there is a group in the department, the name of the doctor will be added to the medical student hierarchy of that department
         */

        let doctorDepartment = await this.medicalDepartmentModel.findOne({'name': department}).exec()
        let doctorNames = `${firstName} ${lastName}`    
        let lastGroupOfDepartmentGroups = doctorDepartment['groups'][doctorDepartment['groups'].length - 1] // getting the last group item of groups
        let lengthOfLastMedicalStudentsArrayInLastGroup = _.size(lastGroupOfDepartmentGroups['medicalStudents'])  // getting the length of the last medical Students array in the last group with lodash

        /*
            if the roles for medical students in a department are filled up,
            fetch the newly created doctor profile with the firstName and lastName, with the specified department and hierarchy,
            and delete it, along with the user associated to the profile.
        */
        if(lengthOfLastMedicalStudentsArrayInLastGroup == 8) { // 8 here is the maximum number of items the medicalStudents array can take
            let hierarchy = DoctorHierarchy.MedicalStudent
            // await this.doctorService.deleteUserLinkedToDoctorProfile(firstName, lastName, department, hierarchy)
            await this.doctorService.deleteDoctorByNamesDepartmentAndHierarchy(firstName, lastName, department, hierarchy)
            //todo: this should be replaced with an email service, Nodemailer or AWS email service, notifying the admin officers and the user that just registered
            console.log("No available space to add a new medical student")
        }

        else { 
            for (let group of doctorDepartment['groups']) {
                if( _.size(group['medicalStudents']) < 8 ){ // only 8 medical students are allowed per group
                    let groupIndex = doctorDepartment['groups'].indexOf(group) // getting the index value of each iterated group
                    await this.medicalDepartmentModel.updateOne({'name': department}, { $push:  { ['groups.' + groupIndex +'.medicalStudents'] : doctorNames }  }) // updating nested array of junior doctor per group item with doctor's names
                    break
                }
            }

            // add to members array of department
            await this.addToMembersOfDepartment(department, doctorNames)
        }
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
        // console.log(departmentGroups)

        if(departmentGroups["groups"].length == 0) {
            const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))
            await sleep(120000) // sleep for 2 minutes before notifying the related parties

            //todo: this should be replaced with an email service, Nodemailer or AWS email service, notifying the admin officers and the user that just registered
            console.log(`A(n) ${hierarchy} can no longer be accepted as of this time.`)
        }

        if(hierarchy == DoctorHierarchy.AssociateSpecialist) {
            await this.addAssociateSpecialistToADepartmentGroup(firstName, lastName, department)
        }
        else if(hierarchy == DoctorHierarchy.JuniorDoctor) {
            await this.addJuniorDoctorToADepartmentGroup(firstName, lastName, department)
        }

        else if(hierarchy == DoctorHierarchy.MedicalStudent) { 
            await this.addMedicalStudentToADepartmentGroup(firstName, lastName, department)
        }

    }

    async editMemberOfGroupByName() {}


    // this action will only be executed by the admin
    async deleteMedicalDepartments() {
        await this.medicalDepartmentModel.deleteMany()
        return {message: 'Medical departments Http successfully'}
    }


    // this action will only be executed by the admin
    async searchAndDeleteMedicalDepartmentByName(name: string) {
        const medicalDepartment = await this.medicalDepartmentModel.findOne({'name': name}).exec()
        if (!medicalDepartment) {throw new NotFoundException('This department cannot be deleted because it does not exist')}
        await this.medicalDepartmentModel.deleteOne({'name': name})
        return {message: 'Medical department deleted successfully'}
    }


    async removeExistingDoctorOrConsultantFromMembersOfDepartment( firstName: string, lastName: string, department: MedicalDepartments) {
        let doctorNames = `${firstName} ${lastName}`
        await this.medicalDepartmentModel.updateOne({'name': department}, {$pull: { 'members': doctorNames }})
    }


    /* 
        this method removes an existing consultant from a department, it will be called by the removeExistingDoctorOrConsultantFromGroupsOfDepartment() method
        on a 'remove.doctor' event, when a doctor profile gets deleted by the admin.
     */
    async removeExistingConsultantFromAGroup(firstName: string, lastName: string, department: MedicalDepartments) {
        let doctorDepartment = await this.medicalDepartmentModel.findOne({'name': department}).exec()
        let doctorNames = `${firstName} ${lastName}`

        for(let group of doctorDepartment['groups']) {
            let groupIndex = doctorDepartment['groups'].indexOf(group) // getting the index value of each iterated group
            if(group['consultant'] == doctorNames) {
                await this.medicalDepartmentModel.updateOne({'name': department}, { $set: { ['groups.' + groupIndex +'.consultant'] : '' }} )
                break
            }
        }
    }


    async removeExistingAssociateSpecialistFromAGroup(firstName: string, lastName: string, department: MedicalDepartments) {
        let doctorDepartment = await this.medicalDepartmentModel.findOne({'name': department}).exec()
        let doctorNames = `${firstName} ${lastName}`

        for(let group of doctorDepartment['groups']) {
            let groupIndex = doctorDepartment['groups'].indexOf(group) // getting the index value of each iterated group
            if( _.includes(group['associateSpecialists'], doctorNames)) { // checking if array of associateSpecialists contains doctor names, with lodash.
                await this.medicalDepartmentModel.updateOne({'name': department}, { $pull: { ['groups.' + groupIndex +'.associateSpecialists'] : doctorNames }})
                break
            }
        }
    }


    async removeExistingJuniorDoctorFromAGroup(firstName: string, lastName: string, department: MedicalDepartments) {
        let doctorDepartment = await this.medicalDepartmentModel.findOne({'name': department}).exec()
        let doctorNames = `${firstName} ${lastName}`

        for(let group of doctorDepartment['groups']) {
            let groupIndex = doctorDepartment['groups'].indexOf(group) // getting the index value of each iterated group
            if( _.includes(group['juniorDoctors'], doctorNames)) { // checking if array of juniorDoctors contains doctor names, with lodash.
                await this.medicalDepartmentModel.updateOne({'name': department}, { $pull: { ['groups.' + groupIndex +'.juniorDoctors'] : doctorNames }})
                break
            }
        }
    }


    async removeExistingMedicalStudentFromAGroup(firstName: string, lastName: string, department: MedicalDepartments) {
        let doctorDepartment = await this.medicalDepartmentModel.findOne({'name': department}).exec()
        let doctorNames = `${firstName} ${lastName}`

        for(let group of doctorDepartment['groups']) {
            let groupIndex = doctorDepartment['groups'].indexOf(group) // getting the index value of each iterated group
            if( _.includes(group['medicalStudents'], doctorNames)) { // checking if array of medicalStudents contains doctor names, with lodash.
                await this.medicalDepartmentModel.updateOne({'name': department}, { $pull: { ['groups.' + groupIndex +'.medicalStudents'] : doctorNames }})
                break
            }
        }
    }


    @OnEvent('remove.doctor')
    async removeExistingDoctorOrConsultantFromGroupsOfDepartment( payload: RemoveDoctorEvent ) {
        /* 
            1. search the department 
            2.Get the hierarchy of the doctor names provided
            3. for every group that's in the groups array of the department...
            4. check the hierarchy provided
            5. if the doctor is seen with the hierarchy, delete the name and break the loop
        */
        
        let firstName = payload.firstName
        let lastName = payload.lastName
        let department = payload.department
        let hierarchy = payload.hierarchy

        if(hierarchy == DoctorHierarchy.Consultant) {
            await this.removeExistingConsultantFromAGroup(firstName, lastName, department)
        }
        else if(hierarchy == DoctorHierarchy.AssociateSpecialist) { 
            await this.removeExistingAssociateSpecialistFromAGroup(firstName, lastName, department)
        }

        else if(hierarchy == DoctorHierarchy.JuniorDoctor) {
            await this.removeExistingJuniorDoctorFromAGroup(firstName, lastName, department)
        }

        else if(hierarchy == DoctorHierarchy.MedicalStudent) { 
            await this.removeExistingMedicalStudentFromAGroup(firstName, lastName, department)
        }

        await this.removeExistingDoctorOrConsultantFromMembersOfDepartment(firstName, lastName, department)
    }
}
