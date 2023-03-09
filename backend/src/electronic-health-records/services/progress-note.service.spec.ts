import { Test, TestingModule } from '@nestjs/testing';
import { ProgressNoteService } from './progress-note.service';
import { getModelToken } from '@nestjs/mongoose';
import { MedicalRecordService } from './medical-record.service';
import { DoctorService } from '../../profiles/services/doctor.service';


describe('ProgressNoteService', () => {
  let service: ProgressNoteService;

  function mockProgressNoteModel (dto: any) {
    this.data = dto
    this.save = () => {return this.data}
  }

  let mockMedicalRecordService = {}
  let mockDoctorService = {}

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProgressNoteService,
        {
          provide: getModelToken('ProgressNote'),
          useValue: mockProgressNoteModel
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

    service = module.get<ProgressNoteService>(ProgressNoteService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
