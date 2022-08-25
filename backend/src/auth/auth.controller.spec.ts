import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import {AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;

  const mockAuthService = {

    registerAdmin: jest.fn((email: string, password: string) => (
      {
        "email": "testuser1@gmail.com",
	      "password": "testpass123",
	      "_id": "1234567",
        "role": "Admin",
	      "__v": 0
      }
    )),

    registerUserPatient: jest.fn((email: string, password: string) => (
      {
        "email": "testuser2@gmail.com",
        "password": "testpass123",
	      "_id": "12345678",
        "role": "User",
        "category": "Patient",
	      "__v": 0
      }
    )),

    registerUserMedicalProvider: jest.fn((email: string, password: string) => (
      {
        "email": "testuser3@gmail.com",
        "password": "testpass123",
	      "_id": "123456789",
        "role": "User",
        "category": "Medical Provider",
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

  it("should return a registered patient", async () => {
    const patient = {
      "email": "testuser2@gmail.com",
      "password": "testpass123",
      "_id": "12345678",
      "role": "User",
      "category": "Patient",
      "__v": 0
    }
    expect(await controller.registerUserPatient({email: 'testuser2@gmail.com', password: 'testpass123'})).toEqual(patient)
  })

  it("should return a registered medical provider", async () => {
    const medicalProvider = {
      "email": "testuser3@gmail.com",
      "password": "testpass123",
      "_id": "123456789",
      "role": "User",
      "category": "Medical Provider",
      "__v": 0
    }
    expect(await controller.registerUserMedicalProvider({email: "testuser3@gmail.com", password: "testpass123",})).toEqual(medicalProvider)
  })

});
