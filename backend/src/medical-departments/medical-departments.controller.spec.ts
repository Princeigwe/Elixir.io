import { Test, TestingModule } from '@nestjs/testing';
import { MedicalDepartmentsController } from './medical-departments.controller';

describe('MedicalDepartmentsController', () => {
  let controller: MedicalDepartmentsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MedicalDepartmentsController],
    }).compile();

    controller = module.get<MedicalDepartmentsController>(MedicalDepartmentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
