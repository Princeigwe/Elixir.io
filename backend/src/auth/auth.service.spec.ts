import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import {JwtService} from '@nestjs/jwt'
import {UsersService} from '../users/users.service'
import {EventEmitter2} from '@nestjs/event-emitter'



describe('AuthService', () => {
  let service: AuthService;

  let mockJwtService = {}
  let mockUsersService = {}
  let mockEventEmitter = {}

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: mockJwtService
        },
        {
          provide: UsersService,
          useValue: mockUsersService
        },
        {
          provide: EventEmitter2, useValue: mockEventEmitter
        }
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
