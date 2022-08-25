import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import {AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;

  const mockAuthService = {

    registerUser: jest.fn((email: string, password: string) => (
      {
        "email": "testuser3@gmail.com",
	      "password": "testpass123",
        "role": "User",
	      "_id": "123456",
	      "__v": 0
      }
    )),

    registerAdmin: jest.fn((email: string, password: string) => (
      {
        "email": "testuser1@gmail.com",
	      "password": "testpass123",
	      "_id": "1234567",
        "role": "Admin",
	      "__v": 0
      }
    )),

    registerPatient: jest.fn((email: string, password: string) => (
      {
        "email": "testuser2@gmail.com",
        "password": "testpass123",
	      "_id": "12345678",
        "role": "User",
        "category": "Patient",
	      "__v": 0
      }
    )),

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

  it('should return a registered user', async() => {
    const user = {
      "email": "testuser3@gmail.com",
      "password": "testpass123",
      "_id": "123456",
      "role": "User",
      "__v": 0
    }
    expect(await controller.registerUser({email: 'testuser3@gmail.com', password: 'testpass123'})).toEqual(user)
  })

  it('should return a registered admin', async () => {
    const user = {
      "email": "testuser1@gmail.com",
      "password": "testpass123",
      "_id": "1234567",
      "role": "Admin",
      "__v": 0
    }
    expect(await controller.registerAdmin({email: 'testuser1@gmail.com', password: 'testpass123'})).toEqual(user)
  })

  it("should return a registered patient", () => {
    const patient = {
      "email": "testuser2@gmail.com",
      "password": "testpass123",
      "_id": "12345678",
      "role": "User",
      "category": "Patient",
      "__v": 0
    }
    expect(controller.registerUserPatient({email: 'testuser2@gmail.com', password: 'testpass123'})).toBe(patient)
  })
});
