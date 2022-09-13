import { Test, TestingModule } from '@nestjs/testing';
import { MedicalDepartmentsService } from './medical-departments.service';
import {getModelToken} from '@nestjs/mongoose'
import { DoctorService } from '../profiles/services/doctor.service';


describe('MedicalDepartmentsService', () => {
  let service: MedicalDepartmentsService;

  function mockMedicalDepartmentModel (dto:any) {
    this.data = dto
    this.save = () => {return this.data}
  }

  let mockDoctorService = {}

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MedicalDepartmentsService,
        { 
          provide: getModelToken('MedicalDepartment'),
          useValue: mockMedicalDepartmentModel
        },
        {
          provide: DoctorService,
          useValue: mockDoctorService
        }
      ],
    }).compile();

    service = module.get<MedicalDepartmentsService>(MedicalDepartmentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
