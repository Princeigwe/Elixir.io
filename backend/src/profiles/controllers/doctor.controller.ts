import { Controller, Get, Param, Delete } from '@nestjs/common';
import {DoctorService} from '../services/doctor.service'

@Controller('doctors')
export class DoctorController {
    constructor(private doctorService: DoctorService) {}

    @Get(':_id')
    async getDoctorProfileById(@Param('_id') _id: string) {
        return await this.doctorService.getDoctorProfileById(_id)
    }

    @Get()
    async getDoctorProfiles() {
        return await this.doctorService.getDoctorProfiles()
    }

    @Delete()
    async deleteDoctorsProfiles() {
        await this.doctorService.deleteDoctorsProfiles()
        return {message: 'Doctor profiles deleted'}
    }

}
