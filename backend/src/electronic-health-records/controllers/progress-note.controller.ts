import { Body, Controller, Param, Post, UseGuards, Request, Get, Query, Patch, Delete, CacheInterceptor, UseInterceptors } from '@nestjs/common';
import { ProgressNoteService } from '../services/progress-note.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ProgressNoteDto } from '../dtos/progress.note.dto';
import { UpdateProgressNoteDto } from '../dtos/update.progress.note.dto';
import {Roles} from '../../roles.decorator'
import {Role} from '../../enums/role.enum'
import { RolesGuard } from '../../roles.guard';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';


@ApiTags('Progress Notes')
@Controller('progress-notes')
export class ProgressNoteController {

    constructor(
        private progressNoteService: ProgressNoteService
    ) {}

    @ApiOperation({description: "Enables the medical provider authorized to medical record add a progress note concerning changes in a patient's medical record. Reference: ProgressNoteDto"})
    @ApiParam({name: "medical_record_id", description: "id of the medical record"})
    @ApiBody({type: ProgressNoteDto})
    @ApiResponse({status: 200})
    @ApiResponse({status: 403, description: "Forbidden action. Request for access to medical record from patient"})
    @UseGuards(JwtAuthGuard)
    @Post(':medical_record_id')
    async createProgressNoteForMedicalRecord( @Param('medical_record_id') medical_record_id, @Body() body: ProgressNoteDto, @Request() request ) {
        const user = request.user
        return await this.progressNoteService.createProgressNoteForMedicalRecord(medical_record_id, body.subjectiveInformation, body.objectiveInformation, body.assessment, body.plan, body.progress, user)
    }


    @ApiOperation({description: "Endpoint that allows administrator to read all progress notes, or query by medical record id"})
    @ApiQuery({name: "medical_record_id", description: "id of medical record", required: false})
    @ApiResponse({status: 403, description: 'Forbidden Resource'})
    @ApiResponse({status: 200})
    @UseGuards(JwtAuthGuard, RolesGuard)
    @UseInterceptors(CacheInterceptor)
    @Get()
    @Roles(Role.Admin)
    async getAllProgressNotes( @Request() request, @Query('medical_record_id') medical_record_id: string) {
        const user = request.user
        if(medical_record_id) {
            return await this.progressNoteService.filterProgressNotesTiedToMedicalRecord(medical_record_id, user)
        }
        else{
            return await this.progressNoteService.getProgressNotes()
        }
    }


    @ApiOperation({description: "This endpoint allows the authenticated patient read their progress notes"})
    @ApiResponse({status: 404,  description: "Progress notes not found."})
    @ApiResponse({status: 200,  description: "Returns progress notes"})
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(CacheInterceptor)
    @Get('/auth-patient')
    async getProgressNotesOfLoggedInPatient( @Request() request ) {
        const user = request.user
        return await this.progressNoteService.getProgressNotesOfLoggedInPatient(user)
    }


    @ApiOperation({description: "Get a progress note by its id. This action can be performed by the admin, the patient and the authorized medical provider"})
    @ApiParam({name: "progress_note_id", description: "id of the progress note"})
    @ApiResponse({status: 200})
    @ApiResponse({status: 403, description: "Forbidden action, as you are not authorized to access resource. If you are a medical provider, request read access to medical record tied to this progress note"})
    @ApiResponse({status: 404, description: "Progress note not found"})
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(CacheInterceptor)
    @Get(':progress_note_id')
    async getProgressNoteByID( @Param('progress_note_id') progress_note_id: string, @Request() request ) {
        const user = request.user
        return await this.progressNoteService.getProgressNoteByID(progress_note_id, user)
    }


    @ApiOperation({description: "This endpoint enables authorized medical providers make changes to a progress note"})
    @ApiParam({name: "progress_note_id", description: "progress note id"})
    @ApiBody({type: UpdateProgressNoteDto})
    @ApiResponse({status: 200})
    @ApiResponse({status: 403, description: "Forbidden action, as you are not authorized to make changes to this resource. If you are a medical provider, request read access to medical record tied to this progress note"})
    @UseGuards(JwtAuthGuard)
    @Patch(':progress_note_id')
    async updateProgressNoteByID( @Param('progress_note_id') progress_note_id: string, @Request() request, @Body() body: UpdateProgressNoteDto ) {
        const user = request.user
        return await this.progressNoteService.updateProgressNoteByID(progress_note_id, body.subjectiveInformation, body.objectiveInformation, body.assessment, body.plan, body.progress, user)
    }


    @ApiOperation({description: "This endpoint deletes all progress notes by the admin"})
    @ApiResponse({status: 203})
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Delete()
    @Roles(Role.Admin)
    async deleteAllProgressNotes() {
        return await this.progressNoteService.deleteAllProgressNotes()
    }


    @ApiOperation({description: "This endpoint deletes a progress note by the admin"})
    @ApiParam({name: "prescription_id", description: "The id of the progress note"})
    @ApiResponse({status: 203})
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Delete('/:progress_note_id')
    @Roles(Role.Admin)
    async deleteProgressNote(@Param('progress_note_id') progress_note_id: string) {
        return await this.progressNoteService.deleteProgressNote(progress_note_id)
    }
    
}
