import { Test, TestingModule } from '@nestjs/testing';
import { MedicalRecordService } from './medical-record.service';
import { getModelToken } from '@nestjs/mongoose';
import { PatientService } from '../../profiles/services/patient.service';
import { DoctorService } from '../../profiles/services/doctor.service';


describe('MedicalRecordService', () => {
  let service: MedicalRecordService;

  let mockPatientService = {}

  let mockDoctorService = {}

  function mockMedicalRecordModel (dto:any) {
    this.data = dto
    this.save = () => {return this.data}
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MedicalRecordService,
        {
          provide: getModelToken('MedicalRecord'),
          useValue: mockMedicalRecordModel
        },

        {
          provide: PatientService,
          useValue: mockPatientService
        },

        {
          provide: DoctorService,
          useValue: mockDoctorService
        }
      ],
    }).compile();

    service = module.get<MedicalRecordService>(MedicalRecordService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
