import { Test, TestingModule } from '@nestjs/testing';
import { MedicalRecordController } from './medical-record.controller';
import { MedicalRecordService } from '../services/medical-record.service';

describe('MedicalRecordController', () => {
  let controller: MedicalRecordController;

  let mockMedicalRecordService = {

    getMedicalRecords: jest.fn( () => {
      return [
        {
          "patient_demographics": {
            "firstName": "John",
            "lastName": "Peter",
            "email": "jp@gmail.com",
            "age": 14,
            "address": "Lagos, Nigeria",
            "telephone": "09099999999"
          },
          "treatment_history": {
            "complaints": [
              "stomach ache"
            ],
            "history_of_illness": [
              "food poisoning"
            ],
            "vital_signs": [
              "vomiting"
            ],
            "medical_allergies": [],
            "habits": []
          },
          "recipients": [],
          "_id": "63ce96f7b2ee1e37bf2674e2",
          "created_at": "2023-01-23T14:17:27.956Z",
          "__v": 0
        },
        {
          "patient_demographics": {
            "firstName": "Alex",
            "lastName": "Walter",
            "email": "testuser5@gmail.com",
            "age": 24,
            "address": "US",
            "telephone": "53950954"
          },
          "treatment_history": {
            "complaints": [
              "stomach ache"
            ],
            "history_of_illness": [
              "food poisoning"
            ],
            "vital_signs": [
              "vomiting"
            ],
            "medical_allergies": [],
            "habits": []
          },
          "recipients": [],
          "_id": "63ceb4ade7a1ef57c04a24d9",
          "created_at": "2023-01-23T16:24:13.253Z",
          "__v": 0
        },
      ]
    } ),

    getMedicalRecordByID: jest.fn( (record_id: string) => {
      record_id = '1234567'
      return {
        "patient_demographics": {
          "firstName": "John",
          "lastName": "Peter",
          "email": "jp@gmail.com",
          "age": 14,
          "address": "Lagos, Nigeria",
          "telephone": "09099999999"
        },
        "treatment_history": {
          "complaints": [
            "stomach ache"
          ],
          "history_of_illness": [
            "food poisoning"
          ],
          "vital_signs": [
            "vomiting"
          ],
          "medical_allergies": [],
          "habits": []
        },
        "recipients": [],
        "_id": record_id,
        "created_at": "2023-01-23T14:17:27.956Z",
        "__v": 0
      }
    } )

  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MedicalRecordController],
      providers: [
        {
          provide: MedicalRecordService,
          useValue: mockMedicalRecordService
        }
      ]
    }).compile();

    controller = module.get<MedicalRecordController>(MedicalRecordController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return list of detailed records', async() => {
    expect(await controller.getMedicalRecords()).toEqual(mockMedicalRecordService.getMedicalRecords())
  })

  it('should return a medical record by id', async() => {
    expect(await controller.getMedicalRecordByID('1234567')).toEqual(mockMedicalRecordService.getMedicalRecordByID('1234567'))
  })
});
