import { Test, TestingModule } from '@nestjs/testing';
import { MedicalDepartmentsService } from './medical-departments.service';

describe('MedicalDepartmentsService', () => {
  let service: MedicalDepartmentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MedicalDepartmentsService],
    }).compile();

    service = module.get<MedicalDepartmentsService>(MedicalDepartmentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
