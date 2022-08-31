import { Controller, Get } from '@nestjs/common';
import {DoctorService} from '../services/doctor.service'

@Controller('doctors')
export class DoctorController {
    constructor(private doctorService: DoctorService) {}

    @Get()
    async getDoctorProfiles() {
        return await this.doctorService.getDoctorProfiles()
    }
}
