import { Injectable, HttpException, HttpStatus, NotFoundException} from '@nestjs/common';
import {UsersService} from '../users/users.service'
import {JwtService} from '@nestjs/jwt'
import * as bcrypt from 'bcrypt';

import {DoctorHierarchy} from '../enums/doctor.hierarchy.enum'
import {MedicalDepartments} from '../enums/medical.department.enum'
import { NewDepartmentConsultantEvent } from '../events/createNewDepartmentGroup.event';
import {EventEmitter2} from '@nestjs/event-emitter'
import {NewMedicalDepartmentDoctorEvent} from '../events/addDoctorToDepartmentGroup.event'
import {MedicalDepartmentsService} from '../medical-departments/medical-departments.service'
import {DoctorService} from '../profiles/services/doctor.service'
const crypto = require('crypto')


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
export class AuthService {
    constructor(
        private userService: UsersService,
        private jwtService: JwtService, // service that will sign a token to the authenticated user payload
        private eventEmitter: EventEmitter2,
        private medicalDepartmentsService: MedicalDepartmentsService,
    ) {}


    // this method is responsible to register an admin
    async registerAdmin(email: string, password: string) {
        const salt = await bcrypt.genSalt(10) // generate salt
        const hashedPassword = await bcrypt.hash(password, salt) //hashing user password to salt
        return this.userService.createAdmin(email, hashedPassword)
    }

    // this method registers a user as a patient
    async registerUserPatient(email: string, password: string) { 
        const salt = await bcrypt.genSalt(10) // generate salt
        const hashedPassword = await bcrypt.hash(password, salt) //hashing user password to salt
        return this.userService.createUserPatient(email, hashedPassword)
    }

    // this method registers a user as a medical provider
    async registerUserMedicalProvider(email: string, firstName: string, lastName: string, password: string, hierarchy: DoctorHierarchy, department: MedicalDepartments, telephone: string, address: string) { 
        const salt = await bcrypt.genSalt(10) // generate salt
        const hashedPassword = await bcrypt.hash(password, salt) //hashing user password to salt
        return this.userService.createUserMedicalProvider(email, firstName, lastName, hashedPassword, hierarchy, department, telephone, address)
    }

    //  ** METHODS TO REGISTER CONSULTANTS TO VARIOUS DEPARTMENTS **

    // - Cardiology
    async registerConsultantToCardiologyDepartment(email: string, firstName: string, lastName: string, password: string, telephone: string, address: string) {
        const hierarchy = DoctorHierarchy.Consultant
        const department = MedicalDepartments.Cardiology

        // this block checks if a department exists, if it doesn't, the consultant cannot be registered into the department
        let existingDepartment = await this.medicalDepartmentsService.getMedicalDepartmentByName(department)
        if(!existingDepartment) {
            throw new NotFoundException(`Consultant cannot be registered to ${department} department, because it does not exist`)
        }

        const consultant = await this.registerUserMedicalProvider(email, firstName, lastName, password, hierarchy, department, telephone, address)
        // emitting an event to create a new group in the cardiology department
        this.eventEmitter.emit('new.consultant', new NewDepartmentConsultantEvent(firstName, lastName, department))
        return consultant
    }

    // - Dermatology 
    async registerConsultantToDermatologyDepartment(email: string, firstName: string, lastName: string, password: string, telephone: string, address: string) {
        const hierarchy = DoctorHierarchy.Consultant
        const department = MedicalDepartments.Dermatology

        // this block checks if a department exists, if it doesn't, the consultant cannot be registered into the department
        let existingDepartment = await this.medicalDepartmentsService.getMedicalDepartmentByName(department)
        if(!existingDepartment) {
            throw new NotFoundException(`Consultant cannot be registered to ${department} department, because it does not exist`)
        }

        const consultant = await this.registerUserMedicalProvider(email, firstName, lastName, password, hierarchy, department, telephone, address)
        // emitting an event to create a new group in the dermatology department
        this.eventEmitter.emit('new.consultant', new NewDepartmentConsultantEvent(firstName, lastName, department))
        return consultant
    }

    // - Urology
    async registerConsultantToUrologyDepartment(email: string, firstName: string, lastName: string, password: string, telephone: string, address: string) { 
        const hierarchy = DoctorHierarchy.Consultant
        const department = MedicalDepartments.Urology

        // this block checks if a department exists, if it doesn't, the consultant cannot be registered into the department
        let existingDepartment = await this.medicalDepartmentsService.getMedicalDepartmentByName(department)
        if(!existingDepartment) {
            throw new NotFoundException(`Consultant cannot be registered to ${department} department, because it does not exist`)
        }

        const consultant = await this.registerUserMedicalProvider(email, firstName, lastName, password, hierarchy, department, telephone, address)
        // emitting an event to create a new group in the urology department
        this.eventEmitter.emit('new.consultant', new NewDepartmentConsultantEvent(firstName, lastName, department))
        return consultant
    }

    // - IntensiveCareMedicine
    async registerConsultantToIntensiveCareMedicineDepartment(email: string, firstName: string, lastName: string, password: string, telephone: string, address: string) { 
        const hierarchy = DoctorHierarchy.Consultant
        const department = MedicalDepartments.IntensiveCareMedicine

        // this block checks if a department exists, if it doesn't, the consultant cannot be registered into the department
        let existingDepartment = await this.medicalDepartmentsService.getMedicalDepartmentByName(department)
        if(!existingDepartment) {
            throw new NotFoundException(`Consultant cannot be registered to ${department} department, because it does not exist`)
        }

        const consultant = await this.registerUserMedicalProvider(email, firstName, lastName, password, hierarchy, department, telephone, address)
        // emitting an event to create a new group in the intensive care medicine department
        this.eventEmitter.emit('new.consultant', new NewDepartmentConsultantEvent(firstName, lastName, department))
        return consultant
    }

    // - Neurology
    async registerConsultantToNeurologyDepartment(email: string, firstName: string, lastName: string, password: string, telephone: string, address: string) { 
        const hierarchy = DoctorHierarchy.Consultant
        const department = MedicalDepartments.Neurology

        // this block checks if a department exists, if it doesn't, the consultant cannot be registered into the department
        let existingDepartment = await this.medicalDepartmentsService.getMedicalDepartmentByName(department)
        if(!existingDepartment) {
            throw new NotFoundException(`Consultant cannot be registered to ${department} department, because it does not exist`)
        }

        const consultant = await this.registerUserMedicalProvider(email, firstName, lastName, password, hierarchy, department, telephone, address)
        // emitting an event to create a new group in the neurology department
        this.eventEmitter.emit('new.consultant', new NewDepartmentConsultantEvent(firstName, lastName, department))
        return consultant
    }

    // - Surgery
    async registerConsultantToSurgeryDepartment(email: string, firstName: string, lastName: string, password: string, telephone: string, address: string) { 
        const hierarchy = DoctorHierarchy.Consultant
        const department = MedicalDepartments.Surgery

        // this block checks if a department exists, if it doesn't, the consultant cannot be registered into the department
        let existingDepartment = await this.medicalDepartmentsService.getMedicalDepartmentByName(department)
        if(!existingDepartment) {
            throw new NotFoundException(`Consultant cannot be registered to ${department} department, because it does not exist`)
        }

        const consultant = await this.registerUserMedicalProvider(email, firstName, lastName, password, hierarchy, department, telephone, address)
        // emitting an event to create a new group in the surgery department
        this.eventEmitter.emit('new.consultant', new NewDepartmentConsultantEvent(firstName, lastName, department))
        return consultant
    }

    // - Radiology
    async registerConsultantToRadiologyDepartment(email: string, firstName: string, lastName: string, password: string, telephone: string, address: string) {
        const hierarchy = DoctorHierarchy.Consultant
        const department = MedicalDepartments.Radiology

        // this block checks if a department exists, if it doesn't, the consultant cannot be registered into the department
        let existingDepartment = await this.medicalDepartmentsService.getMedicalDepartmentByName(department)
        if(!existingDepartment) {
            throw new NotFoundException(`Consultant cannot be registered to ${department} department, because it does not exist`)
        }

        const consultant = await this.registerUserMedicalProvider(email, firstName, lastName, password, hierarchy, department, telephone, address)
        // emitting an event to create a new group in the radiology department
        this.eventEmitter.emit('new.consultant', new NewDepartmentConsultantEvent(firstName, lastName, department))
        return consultant
    }

    // - Pharmacy
    async registerConsultantToPharmacyDepartment(email: string, firstName: string, lastName: string, password: string, telephone: string, address: string) {
        const hierarchy = DoctorHierarchy.Consultant
        const department = MedicalDepartments.Pharmacy

        // this block checks if a department exists, if it doesn't, the consultant cannot be registered into the department
        let existingDepartment = await this.medicalDepartmentsService.getMedicalDepartmentByName(department)
        if(!existingDepartment) {
            throw new NotFoundException(`Consultant cannot be registered to ${department} department, because it does not exist`)
        }

        const consultant = await this.registerUserMedicalProvider(email, firstName, lastName, password, hierarchy, department, telephone, address)
        // emitting an event to create a new group in the pharmacy department
        this.eventEmitter.emit('new.consultant', new NewDepartmentConsultantEvent(firstName, lastName, department))
        return consultant
    }


    /** 
       ** METHOD TO REGISTER NON-CONSULTANTS TO VARIOUS DEPARTMENTS WITH ASSOCIATE SPECIALIST HIERARCHY AS DEFAULT **
        REGISTRATION HERE REQUIRES THE PARTY TO SPECIFY THE HIERARCHY, OR THE DEFAULT ASSOCIATE SPECIALIST HIERARCHY WILL BE USED
        THE DEPARTMENT DATA IS ALSO REQUIRED
    */
    async registerDoctorToADepartment(email: string, firstName: string, lastName: string, password: string, department: MedicalDepartments, telephone: string, address: string, hierarchy?: DoctorHierarchy) {

        // this block checks if a department exists, if it doesn't, the doctor cannot be registered into the department
        let existingDepartment = await this.medicalDepartmentsService.getMedicalDepartmentByName(department)
        if(!existingDepartment) {
            throw new NotFoundException(`${hierarchy} cannot be registered to ${department} department, because it does not exist`)
        }else if(hierarchy == DoctorHierarchy.Consultant) {
            throw new HttpException(`Please register consultant into ${department} department with the appropriate url`, HttpStatus.BAD_REQUEST) 
        }

        const doctor = await this.registerUserMedicalProvider(email, firstName, lastName, password, hierarchy, department, telephone, address)
        this.eventEmitter.emit('new.doctor', new NewMedicalDepartmentDoctorEvent(firstName, lastName, department, hierarchy, email))
        return doctor
    }



    /**
   * We're going to get a user by email, then we're going to compare the password that was passed in
   * with the hashed password that we got from the database. If they match, we'll return the user. If
   * they don't match, we'll throw an error
   * @param {string} email - the email of the user
   * @param {string} password - The password that the user entered in the login form.
   * @returns {
   *         "statusCode": 400,
   *         "message": "Invalid Credentials"
   *     }
   */
    async getValidatedUser(email: string, password: string) {
        const user = await this.userService.getUserByEmail(email)

        // steps to validate hashedPassword
        const hashedPassword = user.password
        const validPassword = await bcrypt.compare(password, hashedPassword)
        if(validPassword) {
            return user
        }else{
            throw new HttpException('Invalid Credentials', HttpStatus.BAD_REQUEST) 
        }

    }

    /**
     * It takes a userId, creates a payload with the userId, signs the payload with the jwtService, and
     * returns the token in a cookie
     * @param {any} userId - any - this is the userId that is returned from the database.
     * @returns A cookie with the JWT token.
     */
    async putJwtInCookieOnLogin(userId: any) {
        const payload = { userId: userId }
        const token = this.jwtService.sign(payload)
        return `Authentication=${token}; HttpOnly; Path=/; Max-Age=86400`;
    }




    async changePassword(email: string, password: string, confirmPassword: string) {
        if(password != confirmPassword) {
            throw new HttpException( 'Passwords do not match.', HttpStatus.BAD_REQUEST )
        }

        const user = await this.userService.getUserByEmailForPasswordResetAndChange(email)
        if (user) {
            const salt = await bcrypt.genSalt(10) // generate salt
            const hashedPassword = await bcrypt.hash(confirmPassword, salt) //hashing user password to salt
            await this.userService.updateUserCredentials(user.email, hashedPassword)
            return { message: 'Your password has been updated successfully' }
        }
    }


    async registerUserPatientAfterOauthFlowIfNotInExistence(email: string) {
        return await this.userService.createOrGetUserAndCreatePatientProfileIfNotInExistenceAfterOAuthFlow(email)
    }

}
