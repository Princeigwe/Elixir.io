import { Test, TestingModule } from '@nestjs/testing';
import { PrescriptionController } from './prescription.controller';
import { PrescriptionService } from '../services/prescription.service';


describe('PrescriptionController', () => {
  let controller: PrescriptionController;

  let mockPrescriptionService = {}

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PrescriptionController],
      providers: [
        {
          provide: PrescriptionService,
          useValue: mockPrescriptionService
        }
      ]
    }).compile();

    controller = module.get<PrescriptionController>(PrescriptionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
