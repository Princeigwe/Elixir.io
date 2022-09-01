import { Test, TestingModule } from '@nestjs/testing';
import { PatientService } from './patient.service';
import {getModelToken} from '@nestjs/mongoose'

describe('PatientService', () => {
  let service: PatientService;

  function mockPatientModel(dto:any) {
    this.data = dto;
    this.save  = () => { return this.data }
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PatientService,
        {
          provide: getModelToken('Patient'),
          useValue: mockPatientModel
        }
      ],
    }).compile();

    service = module.get<PatientService>(PatientService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
