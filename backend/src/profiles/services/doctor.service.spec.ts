import { Test, TestingModule } from '@nestjs/testing';
import { DoctorService } from './doctor.service';
import {getModelToken} from '@nestjs/mongoose'
import {UsersService} from '../../users/users.service'
import { EventEmitter2 } from '@nestjs/event-emitter';



describe('DoctorService', () => {
  let service: DoctorService;

  let mockUsersService = {}
  let mockEventEmitter2 = {}

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
        },
        { 
          provide: EventEmitter2,
          useValue: mockEventEmitter2
        }
      ],
    }).compile();

    service = module.get<DoctorService>(DoctorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
