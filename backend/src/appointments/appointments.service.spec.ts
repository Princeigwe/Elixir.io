import { Test, TestingModule } from '@nestjs/testing';
import { AppointmentsService } from './appointments.service';
import { getModelToken } from '@nestjs/mongoose';
import { PatientService } from '../profiles/services/patient.service';
import { DoctorService } from '../profiles/services/doctor.service';
import {StreamCallService} from '../stream-call/stream-call.service'


describe('AppointmentsService', () => {
  let service: AppointmentsService;

  function mockAppointmentModel (dto:any) {
    this.data = dto
    this.save = () => {return this.data}
  }

  let mockPatientService = {}
  let mockDoctorService = {}
  let mockStreamCallService = {}


  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppointmentsService,
        {
          provide: getModelToken('Appointment'),
          useValue: mockAppointmentModel
        },
        {
          provide: PatientService, useValue: mockPatientService
        },
        {
          provide: DoctorService, useValue: mockDoctorService
        },
        {
          provide: StreamCallService, useValue: mockStreamCallService
        },
      ],
    }).compile();

    service = module.get<AppointmentsService>(AppointmentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
