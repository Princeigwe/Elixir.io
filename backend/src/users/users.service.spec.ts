import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

import {getModelToken} from '@nestjs/mongoose'

describe('UsersService', () => {
  let service: UsersService;

  let mockEventEmitter = {}

  beforeEach(async () => {

    function mockUserModel(dto:any) {
      this.data = dto;
      this.save  = () => { return this.data }
    }
    
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken('User'),
          useValue: mockUserModel
        },
        { provide: EventEmitter2, useValue: mockEventEmitter}
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
