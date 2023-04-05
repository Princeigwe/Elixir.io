import { Test, TestingModule } from '@nestjs/testing';
import { TokenService } from './token.service';
import { getModelToken } from '@nestjs/mongoose';
import { UsersService } from '../users/users.service';
import { AuthService } from '../auth/auth.service';


describe('TokenService', () => {
  let service: TokenService;

  function mockResetTokenModel (dto:any) {
    this.data = dto
    this.save = () => {return this.data}
  }

  let mockUserService = {}
  let mockAuthService = {}

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenService,
        {provide: getModelToken('ResetToken'), useValue: mockResetTokenModel},
        { 
          provide: AuthService,
          useValue: mockAuthService
        },
        { provide: UsersService, 
          useValue: mockUserService
        }
      ],
    }).compile();

    service = module.get<TokenService>(TokenService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
