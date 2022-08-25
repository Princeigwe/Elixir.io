import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import {AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;

  const mockAuthService = {

    registerUser: jest.fn(() => (
      {
        "email": "testuser3@gmail.com",
	      "password": "$2b$10$RkL9RZeAfcLuJZ7FjcLAGOmbV9qEJ6dTaR.v8hkbCzkvcEmU3Qsmi",
	      "_id": "6306bf09da10b393973a01ea",
	      "__v": 0
      }
    ))
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [AuthService]
    }).overrideProvider(AuthService)
      .useValue(mockAuthService)
      .compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

});
