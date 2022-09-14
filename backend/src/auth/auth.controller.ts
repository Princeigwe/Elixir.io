import { Controller, Get, Body, Post, UseGuards, Request, Response, Redirect } from '@nestjs/common';
import { AuthService } from './auth.service';
import {RegisterUserAdminDto} from './dtos/registerUser.dto'
import { LocalAuthGuard } from './guards/local-auth.guard';
import {RegisterUserConsultantDto, RegisterUserDoctorDto} from './dtos/registerMedic.dto'
import {ApiBody, ApiTags, ApiResponse, ApiOperation} from '@nestjs/swagger'


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
    @ApiOperation({description: "Registers an admin"})
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
    @ApiOperation({description: "Registers a user as a patient"})
    @Post('register-user-patient')
    async registerUserPatient(@Body() body: RegisterUserAdminDto) {
        return this.authService.registerUserPatient(body.email, body.password)
    }

    //  ** REGISTRATION LINKS TO VARIOUS DEPARTMENTS FOR CONSULTANTS **

    // Cardiology
    @ApiBody({type: RegisterUserConsultantDto})
    @ApiOperation({description: "Registers a user as a consultant into the Cardiology department"})
    @Post('registration-consultant-cardiology')
    async registerConsultantToCardiologyDepartment(@Body() body: RegisterUserConsultantDto) { 
        return this.authService.registerConsultantToCardiologyDepartment(body.email, body.firstName, body.lastName, body.password)
    }

    // Dermatology
    @ApiBody({type: RegisterUserConsultantDto})
    @ApiOperation({description: "Registers a user as a consultant into the Dermatology department"})
    @Post('registration-consultant-dermatology')
    async registerConsultantToDermatologyDepartment(@Body() body: RegisterUserConsultantDto) {
        return this.authService.registerConsultantToDermatologyDepartment(body.email, body.firstName, body.lastName, body.password)
    }

    // - Urology
    @ApiBody({type: RegisterUserConsultantDto})
    @ApiOperation({description: "Registers a user as a consultant into the Urology department"})
    @Post('registration-consultant-urology')
    async registerConsultantToUrologyDepartment(@Body() body: RegisterUserConsultantDto) {
        return this.authService.registerConsultantToUrologyDepartment(body.email, body.firstName, body.lastName, body.password)
    }

    // - IntensiveCareMedicine
    @ApiBody({type: RegisterUserConsultantDto})
    @ApiOperation({description: "Registers a user as a consultant into the Intensive Care Medicine department"})
    @Post('registration-consultant-intensive-care-medicine')
    async registerConsultantToIntensiveCareMedicineDepartment(@Body() body: RegisterUserConsultantDto) {
        return this.authService.registerConsultantToIntensiveCareMedicineDepartment(body.email, body.firstName, body.lastName, body.password)
    }

    // - Neurology
    @ApiBody({type: RegisterUserConsultantDto})
    @ApiOperation({description: "Registers a user as a consultant into the Neurology department"})
    @Post('registration-consultant-neurology')
    async registerConsultantToNeurologyDepartment(@Body() body: RegisterUserConsultantDto) {
        return this.authService.registerConsultantToNeurologyDepartment(body.email, body.firstName, body.lastName, body.password)
    }

    // - Surgery
    @ApiBody({type: RegisterUserConsultantDto})
    @ApiOperation({description: "Registers a user as a consultant into the Surgery department"})
    @Post('registration-consultant-surgery')
    async registerConsultantToSurgeryDepartment(@Body() body: RegisterUserConsultantDto) {
        return this.authService.registerConsultantToSurgeryDepartment(body.email, body.firstName, body.lastName, body.password)
    }

    // - Radiology
    @ApiBody({type: RegisterUserConsultantDto})
    @ApiOperation({description: "Registers a user as a consultant into the Radiology department"})
    @Post('registration-consultant-radiology')
    async registerConsultantToRadiologyDepartment(@Body() body: RegisterUserConsultantDto) {
        return this.authService.registerConsultantToRadiologyDepartment(body.email, body.firstName, body.lastName, body.password)
    }

    // - Pharmacy
    @ApiBody({type: RegisterUserConsultantDto})
    @ApiOperation({description: "Registers a user as a consultant into the Pharmacy department"})
    @Post('registration-consultant-pharmacy')
    async registerConsultantToPharmacyDepartment(@Body() body: RegisterUserConsultantDto) {
        return this.authService.registerConsultantToPharmacyDepartment(body.email, body.firstName, body.lastName, body.password)
    }

    // ** REGISTRATION LINK TO REGISTER NON-CONSULTANTS TO VARIOUS DEPARTMENTS WITH ASSOCIATE SPECIALIST HIERARCHY AS DEFAULT **
    
    @Redirect('http://localhost:3000/auth/doctor-form-submitted')
    @Post('registration-doctor')
    async registerDoctorToADepartment(@Body() body: RegisterUserDoctorDto) { 
        return this.authService.registerDoctorToADepartment(body.email, body.firstName, body.lastName, body.password, body.department, body.hierarchy)
    }


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
}
