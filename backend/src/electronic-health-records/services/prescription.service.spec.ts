import { Test, TestingModule } from '@nestjs/testing';
import { PrescriptionService } from './prescription.service';
import { getModelToken } from '@nestjs/mongoose';
import { MedicalRecordService } from './medical-record.service';
import { DoctorService } from '../../profiles/services/doctor.service';


describe('PrescriptionService', () => {
  let service: PrescriptionService;

  function mockPrescriptionModel(dto: any) {
    this.data = dto
    this.save = () => {return this.data}
  }

  let mockMedicalRecordService = {}
  let mockDoctorService = {}

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrescriptionService,
        {
          provide: getModelToken('Prescription'),
          useValue: mockPrescriptionModel
        },
        {
          provide: MedicalRecordService,
          useValue: mockMedicalRecordService
        },
        {
          provide: DoctorService,
          useValue: mockDoctorService
        }
      ],
    }).compile();

    service = module.get<PrescriptionService>(PrescriptionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
