import { Controller, Get, Body, Post, UseGuards, Request, Response } from '@nestjs/common';
import { AuthService } from './auth.service';
import {RegisterUserAdminDto} from './dtos/registerUser.dto'
import { LocalAuthGuard } from './guards/local-auth.guard';
import {RegisterUserMedicDto} from './dtos/registerMedic.dto'


@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    // role based registration for user and admin 

    @Post('register-admin')
    async registerAdmin(@Body() body: RegisterUserAdminDto) {
        return this.authService.registerAdmin(body.email, body.password)
    }


    // user category based registration for patients and medical professionals

    @Post('register-user-patient')
    async registerUserPatient(@Body() body: RegisterUserAdminDto) {
        return this.authService.registerUserPatient(body.email, body.password)
    }

    // @Post('register-user-medic')
    // async registerUserMedicalProvider(@Body() body: RegisterUserMedicDto) {
    //     return this.authService.registerUserMedicalProvider(body.email, body.firstName, body.lastName, body.password)

    // }

    //  ** REGISTRATION LINKS TO VARIOUS DEPARTMENTS FOR CONSULTANTS **

    // Cardiology
    @Post('registration-consultant-cardiology')
    async registerConsultantToCardiologyDepartment(@Body() body: RegisterUserMedicDto) { 
        return this.authService.registerConsultantToCardiologyDepartment(body.email, body.firstName, body.lastName, body.password)
    }

    // Dermatology
    @Post('registration-consultant-dermatology')
    async registerConsultantToDermatologyDepartment(@Body() body: RegisterUserMedicDto) {
        return this.authService.registerConsultantToDermatologyDepartment(body.email, body.firstName, body.lastName, body.password)
    }

    // - Urology
    @Post('registration-consultant-urology')
    async registerConsultantToUrologyDepartment(@Body() body: RegisterUserMedicDto) {
        return this.authService.registerConsultantToUrologyDepartment(body.email, body.firstName, body.lastName, body.password)
    }

    // - IntensiveCareMedicine
    @Post('registration-consultant-intensive-care-medicine')
    async registerConsultantToIntensiveCareMedicineDepartment(@Body() body: RegisterUserMedicDto) {
        return this.authService.registerConsultantToIntensiveCareMedicineDepartment(body.email, body.firstName, body.lastName, body.password)
    }

    // - Neurology
    @Post('registration-consultant-neurology')
    async registerConsultantToNeurologyDepartment(@Body() body: RegisterUserMedicDto) {
        return this.authService.registerConsultantToNeurologyDepartment(body.email, body.firstName, body.lastName, body.password)
    }

    // - Surgery
    @Post('registration-consultant-surgery')
    async registerConsultantToSurgeryDepartment(@Body() body: RegisterUserMedicDto) {
        return this.authService.registerConsultantToSurgeryDepartment(body.email, body.firstName, body.lastName, body.password)
    }

    // - Radiology
    @Post('registration-consultant-radiology')
    async registerConsultantToRadiologyDepartment(@Body() body: RegisterUserMedicDto) {
        return this.authService.registerConsultantToRadiologyDepartment(body.email, body.firstName, body.lastName, body.password)
    }

    // - Pharmacy
    @Post('registration-consultant-pharmacy')
    async registerConsultantToPharmacyDepartment(@Body() body: RegisterUserMedicDto) {
        return this.authService.registerConsultantToPharmacyDepartment(body.email, body.firstName, body.lastName, body.password)
    }


    @UseGuards(LocalAuthGuard)
    @Post('login')
    async login(@Request() request, @Response() response) {
        const user = request.user;
        const cookie = await this.authService.putJwtInCookieOnLogin(user.id)
        response.setHeader('Set-Cookie', cookie)
        return response.send(user)
    }
}
