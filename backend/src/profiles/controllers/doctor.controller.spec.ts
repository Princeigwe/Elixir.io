import { Test, TestingModule } from '@nestjs/testing';
import { DoctorController } from './doctor.controller';
import {DoctorService} from '../services/doctor.service'

describe('DoctorController', () => {
  let controller: DoctorController;

  let mockDoctorService = {}

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DoctorController],
      providers: [
        {
          provide: DoctorService,
          useValue: mockDoctorService
        }
      ]
    }).compile();

    controller = module.get<DoctorController>(DoctorController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
