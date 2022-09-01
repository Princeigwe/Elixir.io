import { Test, TestingModule } from '@nestjs/testing';
import { PatientController } from './patient.controller';
import {PatientService} from '../services/patient.service'
import {NewUserEvent} from '../../events/createProfileByUser.event'
import {MaritalStatus} from '../../enums/marital.status.enum'

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

    getPatientProfiles: jest.fn( () => {
      return [
        {
          "_id": "1234567",
          "user": "630f9ec1ccfea4acf8eb4986",
          "maritalStatus": "Single",
          "medicalIssues": [],
          "prescriptions": [],
          "__v": 0
        },

        {
          "_id": "12345678",
          "user": "630f9ec1ccfea4acf8eb4986",
          "maritalStatus": "Single",
          "medicalIssues": [],
          "prescriptions": [],
          "__v": 0
        }
      ]
    } ),

    editBasicPatientProfileById: jest.fn( (_id: string, firstName: string, lastName: string, age: number, address: string, telephone: string, occupants: string, maritalStatus: string) => {
      return {
        "_id": "12345678",
        "user": "630f9ec1ccfea4acf8eb4986",
        "maritalStatus": "Single",
        "medicalIssues": [],
        "prescriptions": [],
        "__v": 0,
        "address": "London",
        "age": 24,
        "firstName": "john",
        "lastName": "Smith",
        "occupation": "Lawyer",
        "telephone": "53950954"
      }
    } ),

    deletePatientsProfiles: jest.fn( () => {
      return { message: 'Patients profiles deleted'}
    } ),

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

  it('should return an array of patients', async () => {
    let patients = [
      {
        "_id": "1234567",
        "user": "630f9ec1ccfea4acf8eb4986",
        "maritalStatus": "Single",
        "medicalIssues": [],
        "prescriptions": [],
        "__v": 0
      },

      {
        "_id": "12345678",
        "user": "630f9ec1ccfea4acf8eb4986",
        "maritalStatus": "Single",
        "medicalIssues": [],
        "prescriptions": [],
        "__v": 0
      }
    ]
    expect(await controller.getPatientProfiles()).toEqual(patients)
  })

  it('should edit basic patient profile data', async () => {
    let patient = {
      "_id": "12345678",
      "user": "630f9ec1ccfea4acf8eb4986",
      "maritalStatus": "Single",
      "medicalIssues": [],
      "prescriptions": [],
      "__v": 0,
      "address": "London",
      "age": 24,
      "firstName": "john",
      "lastName": "Smith",
      "occupation": "Lawyer",
      "telephone": "53950954"
    }

    expect(await controller.editBasicPatientProfileById( '12345678' , {firstName: "John", lastName: "Smith", age: 24, address: "London", telephone: "53950954", occupation: "Lawyer", maritalStatus: MaritalStatus.Single} )).toEqual(patient)
  })

  it('should return a delete message', async () => {
    let response = { message: 'Patients profiles deleted'}
    expect(await controller.deletePatientsProfiles()).toEqual(response)
  })

});
