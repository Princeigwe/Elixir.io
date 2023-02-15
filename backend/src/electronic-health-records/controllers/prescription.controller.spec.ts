import { Test, TestingModule } from '@nestjs/testing';
import { PrescriptionController } from './prescription.controller';

describe('PrescriptionController', () => {
  let controller: PrescriptionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PrescriptionController],
    }).compile();

    controller = module.get<PrescriptionController>(PrescriptionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
