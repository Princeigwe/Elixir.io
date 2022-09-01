import { Test, TestingModule } from '@nestjs/testing';
import { PatientController } from './patient.controller';
import {PatientService} from '../services/patient.service'
import {NewUserEvent} from '../../events/createProfileByUser.event'

describe('PatientController', () => {
  let controller: PatientController;


  let mockPatientService = {
    getPatientProfileById: jest.fn((_id: string) => {
      return {
        "_id": "1234567",
        "user": "630f9ec1ccfea4acf8eb4986",
        "maritalStatus": "Single",
        "medicalIssues": [],
        "prescriptions": [],
        "__v": 0
      }
    }),


  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PatientController],
      providers: [
        {
          provide: PatientService,
          useValue: mockPatientService
        }
      ]
    }).compile();

    controller = module.get<PatientController>(PatientController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return a single patient', async() => {
    let patient = {
        "_id": "1234567",
        "user": "630f9ec1ccfea4acf8eb4986",
        "maritalStatus": "Single",
        "medicalIssues": [],
        "prescriptions": [],
        "__v": 0
    }
    expect(await controller.getPatientProfileById('1234567')).toEqual(patient)
  })
});
