import { Controller, Get, Param, Delete, Patch, Body } from '@nestjs/common';
import {DoctorService} from '../services/doctor.service'
import {EditDoctorDto} from '../dtos/edit.doctor.dto'

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

    @Patch(':_id')
    async editBasicDoctorProfileById(@Param('_id') _id: string, @Body() body: EditDoctorDto) {
        return await this.doctorService.editBasicDoctorProfileById(_id, body)
    }

    @Delete()
    async deleteDoctorsProfiles() {
        await this.doctorService.deleteDoctorsProfiles()
        return {message: 'Doctor profiles deleted'}
    }

}
