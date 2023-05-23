import { Test, TestingModule } from '@nestjs/testing';
import { PatientController } from './patient.controller';
import {PatientService} from '../services/patient.service'
import {NewUserEvent} from '../../events/createProfileByUser.event'
import {MaritalStatus} from '../../enums/marital.status.enum'
import {Request} from '@nestjs/common'

describe('PatientController', () => {
  let controller: PatientController;


  let mockPatientService = {
    

    getPatientProfileById: jest.fn((_id: string) => {
      _id = '1234567'
      return {
        "assignedDoctor": {
          "department": "Cardiology",
          "email": "testuser5@gmail.com",
          "name": "Clark Peterson",
          "telephone": "12121212"
        },
        "_id": "1234567",
        "user": "123456789",
        "email": "testuser11@gmail.com",
        "maritalStatus": "Single",
        "__v": 0,
        "address": "Spain",
        "age": 24,
        "firstName": "Amyyy",
        "lastName": "Woodsss",
        "occupation": "Lawyer",
        "telephone": "53950954"
      }
    }),

    getPatientProfiles: jest.fn( () => {
      return [
        {
          "assignedDoctor": {
            "department": "Cardiology",
            "email": "testuser5@gmail.com",
            "name": "Clark Peterson",
            "telephone": "12121212"
          },
          "_id": "63e3c3b22eb5c00110c25ffd",
          "user": "63e3c3b22eb5c00110c25ffc",
          "email": "testuser11@gmail.com",
          "maritalStatus": "Single",
          "__v": 0,
          "address": "Spain",
          "age": 24,
          "firstName": "Amyyy",
          "lastName": "Woodsss",
          "occupation": "Lawyer",
          "telephone": "53950954"
        },
        {
          "_id": "63e3c3bd2eb5c00110c26002",
          "user": "63e3c3bd2eb5c00110c26001",
          "email": "testuser12@gmail.com",
          "maritalStatus": "Married",
          "__v": 0,
          "address": "Rome",
          "age": 24,
          "firstName": "Jackson",
          "lastName": "Michael",
          "occupation": "Artist",
          "telephone": "53950954"
        }
      ]
    } ),


    assignDoctorToPatient: jest.fn( (patientId: string, doctorFirstName: string, doctorLastName: string) => {
      patientId = '1234567',
      doctorFirstName = 'Matthew'
      doctorLastName = 'Smith'

      return {
        "assignedDoctor": {
          "department": "Cardiology",
          "email": "testuser5@gmail.com",
          "name": `${doctorFirstName} ${doctorLastName}`,
          "telephone": "12121212"
        },
        "_id": patientId,
        "user": "63e3c3b22eb5c00110c25ffc",
        "email": "testuser11@gmail.com",
        "maritalStatus": "Single",
        "__v": 0,
        "address": "Spain",
        "age": 24,
        "firstName": "Amyyy",
        "lastName": "Woodsss",
        "occupation": "Lawyer",
        "telephone": "53950954"
      }
    } )

    // deletePatientsProfiles: jest.fn( () => {
    //   return { message: 'Patients profiles deleted'}
    // } ),

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
    expect(await controller.getPatientProfileById('1234567')).toEqual(mockPatientService.getPatientProfileById('1234567'))
  })

  it('should return an array of patients', async () => {
    expect(await controller.getPatientProfiles()).toEqual(mockPatientService.getPatientProfiles())
  })


  it('should assert that the assigned doctor name', async () => {
    expect( await controller.assignDoctorToPatient('1234567', Request, { doctorFirstName: 'Matthew', doctorLastName: 'Smith' })).toEqual(mockPatientService.assignDoctorToPatient('1234567', 'Matthew', 'Smith'))
  })

  // it('should return a delete message', async () => {
  //   let response = { message: 'Patients profiles deleted'}
  //   expect(await controller.deletePatientsProfiles()).toEqual(response)
  // })

});
