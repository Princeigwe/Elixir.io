import { Controller, Get, Body, Post, UseGuards, Request, Response, Redirect } from '@nestjs/common';
import { AuthService } from './auth.service';
import {RegisterUserAdminDto} from './dtos/registerUser.dto'
import { LocalAuthGuard } from './guards/local-auth.guard';
import {RegisterUserConsultantDto, RegisterUserDoctorDto} from './dtos/registerMedic.dto'
import {ApiBody, ApiTags, ApiResponse, ApiOperation} from '@nestjs/swagger'
import { ChangePasswordDto } from './dtos/change.password.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {Auth0AuthGuard} from './guards/auth0-auth.guard'


@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    // role based registration for user and admin 

    @ApiBody({type: RegisterUserAdminDto}) // Swagger doc for request body
    @ApiResponse({ 
        status: 200,
        description: "Returns a user object"
    })
    @ApiOperation({description: "Registers an admin. Reference: RegisterUserAdminDto"})
    @Post('register-admin')
    async registerAdmin(@Body() body: RegisterUserAdminDto) {
        return this.authService.registerAdmin(body.email, body.password)
    }


    // *** USER CATEGORY BASED REGISTRATION FOR PATIENTS AND MEDICAL PROVIDERS ***

    @ApiBody({type: RegisterUserAdminDto}) // Swagger doc for request body
    @ApiResponse({  // Swagger Docs response type
        status: 200,
        description: "Returns a user object"
    })
    @ApiOperation({description: "Registers a user as a patient. Reference: RegisterUserAdminDto"})
    @Post('register-user-patient')
    async registerUserPatient(@Body() body: RegisterUserAdminDto) {
        return this.authService.registerUserPatient(body.email, body.password)
    }

    //  ** REGISTRATION LINKS TO VARIOUS DEPARTMENTS FOR CONSULTANTS **

    // Cardiology
    @ApiBody({type: RegisterUserConsultantDto})
    @ApiOperation({description: "Registers a user as a consultant into the Cardiology department. Reference: RegisterUserConsultantDto"})
    @Post('registration-consultant-cardiology')
    async registerConsultantToCardiologyDepartment(@Body() body: RegisterUserConsultantDto) { 
        return this.authService.registerConsultantToCardiologyDepartment(body.email, body.firstName, body.lastName, body.password, body.telephone, body.address)
    }

    // Dermatology
    @ApiBody({type: RegisterUserConsultantDto})
    @ApiOperation({description: "Registers a user as a consultant into the Dermatology department. Reference: RegisterUserConsultantDto"})
    @Post('registration-consultant-dermatology')
    async registerConsultantToDermatologyDepartment(@Body() body: RegisterUserConsultantDto) {
        return this.authService.registerConsultantToDermatologyDepartment(body.email, body.firstName, body.lastName, body.password, body.telephone, body.address)
    }

    // - Urology
    @ApiBody({type: RegisterUserConsultantDto})
    @ApiOperation({description: "Registers a user as a consultant into the Urology department. Reference: RegisterUserConsultantDto"})
    @Post('registration-consultant-urology')
    async registerConsultantToUrologyDepartment(@Body() body: RegisterUserConsultantDto) {
        return this.authService.registerConsultantToUrologyDepartment(body.email, body.firstName, body.lastName, body.password, body.telephone, body.address)
    }

    // - IntensiveCareMedicine
    @ApiBody({type: RegisterUserConsultantDto})
    @ApiOperation({description: "Registers a user as a consultant into the Intensive Care Medicine department. Reference: RegisterUserConsultantDto"})
    @Post('registration-consultant-intensive-care-medicine')
    async registerConsultantToIntensiveCareMedicineDepartment(@Body() body: RegisterUserConsultantDto) {
        return this.authService.registerConsultantToIntensiveCareMedicineDepartment(body.email, body.firstName, body.lastName, body.password, body.telephone, body.address)
    }

    // - Neurology
    @ApiBody({type: RegisterUserConsultantDto})
    @ApiOperation({description: "Registers a user as a consultant into the Neurology department. Reference: RegisterUserConsultantDto"})
    @Post('registration-consultant-neurology')
    async registerConsultantToNeurologyDepartment(@Body() body: RegisterUserConsultantDto) {
        return this.authService.registerConsultantToNeurologyDepartment(body.email, body.firstName, body.lastName, body.password, body.telephone, body.address)
    }

    // - Surgery
    @ApiBody({type: RegisterUserConsultantDto})
    @ApiOperation({description: "Registers a user as a consultant into the Surgery department. Reference: RegisterUserConsultantDto"})
    @Post('registration-consultant-surgery')
    async registerConsultantToSurgeryDepartment(@Body() body: RegisterUserConsultantDto) {
        return this.authService.registerConsultantToSurgeryDepartment(body.email, body.firstName, body.lastName, body.password, body.telephone, body.address)
    }

    // - Radiology
    @ApiBody({type: RegisterUserConsultantDto})
    @ApiOperation({description: "Registers a user as a consultant into the Radiology department. Reference: RegisterUserConsultantDto"})
    @Post('registration-consultant-radiology')
    async registerConsultantToRadiologyDepartment(@Body() body: RegisterUserConsultantDto) {
        return this.authService.registerConsultantToRadiologyDepartment(body.email, body.firstName, body.lastName, body.password, body.telephone, body.address)
    }

    // - Pharmacy
    @ApiBody({type: RegisterUserConsultantDto})
    @ApiOperation({description: "Registers a user as a consultant into the Pharmacy department. Reference: RegisterUserConsultantDto"})
    @Post('registration-consultant-pharmacy')
    async registerConsultantToPharmacyDepartment(@Body() body: RegisterUserConsultantDto) {
        return this.authService.registerConsultantToPharmacyDepartment(body.email, body.firstName, body.lastName, body.password, body.telephone, body.address)
    }

    // ** REGISTRATION LINK TO REGISTER NON-CONSULTANTS TO VARIOUS DEPARTMENTS WITH ASSOCIATE SPECIALIST HIERARCHY AS DEFAULT **
    
    @ApiOperation({description: "Registers a doctor that is not a consultant into the defined department. Reference: RegisterUserDoctorDto"})
    @Redirect('http://localhost:3000/api/v1/auth/doctor-form-submitted')
    @Post('register-doctor')
    async registerDoctorToADepartment(@Body() body: RegisterUserDoctorDto) { 
        return this.authService.registerDoctorToADepartment(body.email, body.firstName, body.lastName, body.password, body.department, body.telephone, body.address, body.hierarchy)
    }


    @ApiBody({type: RegisterUserAdminDto}) // Swagger doc for request body
    @ApiOperation({description: "Logs in a user with a (email, password) request body, returns a jwt in return within a cookie"})
    @UseGuards(LocalAuthGuard)
    @Post('login')
    async login(@Request() request, @Response() response) {
        const user = request.user;
        const cookie = await this.authService.putJwtInCookieOnLogin(user.id)
        response.setHeader('Set-Cookie', cookie)
        return response.send(user)
    }

    @Get('doctor-form-submitted')
    async doctorRegistrationFormSubmitted() {
        return { message: "Form submitted successfully" }
    }

    @UseGuards(JwtAuthGuard)
    @Post('change-password')
    async changePassword( @Body() body: ChangePasswordDto, @Request() request) {
        const user = request.user
        return await this.authService.changePassword(user.email, body.password, body.confirmPassword)
    }



    @UseGuards(Auth0AuthGuard)
    @Get('patient/auth0')
    async loginPatientWithGoogle() {}


    @UseGuards(Auth0AuthGuard)
    @Get('patient/callback/auth0')
    async auth0GoogleCallback( @Request() request, @Response() response ) {
        const user =  request.user
        const elixirIOUser = await this.authService.registerUserPatientAfterOauthFlowIfNotInExistence(user.email)
        const cookie = await this.authService.putJwtInCookieOnLogin(user.id)
        response.setHeader('Set-Cookie', cookie)
        return response.send(elixirIOUser)
    }

}
