import { Test, TestingModule } from '@nestjs/testing';
import { DoctorService } from './doctor.service';
import {getModelToken} from '@nestjs/mongoose'
import {UsersService} from '../../users/users.service'


describe('DoctorService', () => {
  let service: DoctorService;

  let mockUsersService = {}

  function mockDoctorModel (dto:any) {
    this.data = dto
    this.save = () => {return this.data}
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DoctorService,
        {
          provide: getModelToken('Doctor'),
          useValue: mockDoctorModel
        },
        { 
          provide: UsersService,
          useValue: mockUsersService
        }
      ],
    }).compile();

    service = module.get<DoctorService>(DoctorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
