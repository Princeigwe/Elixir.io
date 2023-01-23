import { Test, TestingModule } from '@nestjs/testing';
import { MedicalRecordController } from './medical-record.controller';

describe('MedicalRecordController', () => {
  let controller: MedicalRecordController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MedicalRecordController],
    }).compile();

    controller = module.get<MedicalRecordController>(MedicalRecordController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
