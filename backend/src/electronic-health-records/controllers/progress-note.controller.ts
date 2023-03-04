import { Body, Controller, Param, Post, UseGuards, Request, Get } from '@nestjs/common';
import { ProgressNoteService } from '../services/progress-note.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ProgressNoteDto } from '../dtos/progress.note.dto';
import {Roles} from '../../roles.decorator'
import {Role} from '../../enums/role.enum'
import { RolesGuard } from '../../roles.guard';


@Controller('progress-notes')
export class ProgressNoteController {

    constructor(
        private progressNoteService: ProgressNoteService
    ) {}

    @UseGuards(JwtAuthGuard)
    @Post(':medical_record_id')
    async createProgressNoteForMedicalRecord( @Param('medical_record_id') medical_record_id, @Body() body: ProgressNoteDto, @Request() request ) {
        const user = request.user
        return await this.progressNoteService.createProgressNoteForMedicalRecord(medical_record_id, body.subjectiveInformation, body.objectiveInformation, body.assessment, body.plan, body.progress, user)
    }


    @UseGuards(JwtAuthGuard, RolesGuard)
    @Get()
    @Roles(Role.Admin)
    async getAllProgressNotes() {
        return await this.progressNoteService.getAllProgressNotes()
    }
}
