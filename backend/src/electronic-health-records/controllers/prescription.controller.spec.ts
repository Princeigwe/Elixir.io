import { Test, TestingModule } from '@nestjs/testing';
import { PrescriptionController } from './prescription.controller';
import { PrescriptionService } from '../services/prescription.service';
import { User } from '../../users/users.schema';
import { RouteOfAdministration } from '../../enums/route.of.administration.enum';
import {UserCategory} from '../../enums/user.category.enum'
import {Role} from '../../enums/role.enum'
import * as AesEncryption from 'aes-encryption'
import {Request} from 'express'
import exp from 'constants';

const aes = new AesEncryption()
aes.setSecretKey(process.env.ENCRYPTION_KEY || '11122233344455566677788822244455555555555555555231231321313aaaff')

type medication = {
  name: string,
  dosage: string,
  routeOfAdministration: RouteOfAdministration,
  frequency: string,
  duration: string,
}

describe('PrescriptionController', () => {
  let controller: PrescriptionController;

  let mockPrescriptionService = {
    
    addPrescriptionToMedicalRecord: jest.fn( ( record_id: string, user: User, medications: medication[], instructions: string ) => {
      record_id = "6405466ba1facf807b676ab2"
      instructions = "Drink water and rest a lot. Have fun too"
      medications = [
        {
          "name": "Paracetamol",
          "dosage": "two tablets",
          "routeOfAdministration": RouteOfAdministration.Oral,
          "frequency": "twice daily",
          "duration": "5 days"
        },
        {
          "name": "Ampliclox",
          "dosage": "two tablets",
          "routeOfAdministration": RouteOfAdministration.Oral,
          "frequency": "thrice weekly",
          "duration": "2 years"
        }
      ]
      return {
        "medical_record_id": record_id,
        "patient_demographics": {
          "firstName" : aes.encrypt("John"),
          "lastName"  : aes.encrypt("Smith"),
          "email"     : aes.encrypt("testuser2@gmail"),
          "age"       : 24,
          "address"   : aes.encrypt("London, UK"),
          "telephone" : aes.encrypt("9090909090")
        },
        "prescriber": {
          "doctor_firstName"  : aes.encrypt("Matthew"),
          "doctor_lastName"   : aes.encrypt("Cole"),
          "doctor_department" : aes.encrypt("Cardiology"),
          "doctor_email"      : aes.encrypt("testuser@gmail.com"),
          "doctor_telephone"  : aes.encrypt("090909090")
        },
        "medications": [
          {
            "name": aes.encrypt( medications[0]['name'] ),
            "dosage": aes.encrypt( medications[0]['dosage'] ),
            "routeOfAdministration": aes.encrypt( medications[0]['routeOfAdministration'] ),
            "frequency": aes.encrypt( medications[0]['frequency'] ),
            "duration": aes.encrypt( medications[0]['duration'] )
          },
          {
            "name": aes.encrypt( medications[1]['name'] ),
            "dosage": aes.encrypt( medications[1]['dosage'] ),
            "routeOfAdministration": aes.encrypt( medications[1]['routeOfAdministration'] ),
            "frequency": aes.encrypt( medications[1]['frequency'] ),
            "duration": aes.encrypt( medications[1]['duration'] )
          }
        ],
        "instructions": aes.encrypt(instructions)
      }
    } ),

    getPrescriptionsOfLoggedInPatient: jest.fn( (user: User) => {
      user = {email: "testuser2@gmail.com", password: "testpass123", role: Role.User, category: UserCategory.Patient}
      return [
        {
          "_id": "63fa8b3947bf1cf1ad4efca1",
          "medicalRecord": "63fa869bebcdd8ee03e886d0",
          "patient_demographics": {
            "firstName": "Amyyy",
            "lastName": "Woodsss",
            "email": user.email,
            "age": 24,
            "address": "Spain",
            "telephone": "53950954"
          },
          "prescriber": {
            "doctor_firstName": "Clark",
            "doctor_lastName": "Peterson",
            "doctor_department": "Cardiology",
            "doctor_email": "testuser5@gmail.com",
            "doctor_telephone": "12121212"
          },
          "medications": [
            {
              "name": "Paracetamol",
              "dosage": "two tablets",
              "duration": "5 days",
              "frequency": "twice daily",
              "routeOfAdministration": "Oral"
            },
            {
              "name": "Ampliclox",
              "dosage": "two tablets",
              "duration": "2 years",
              "frequency": "thrice weekly",
              "routeOfAdministration": "Injection"
            }
          ],
          "instructions": "Drink water and rest a lot. Have fun too",
          "createdAt": "2023-02-25T22:27:05.365Z",
          "__v": 1
        }
      ]
    } ),

    getPrescriptionByID: jest.fn( (prescription_id: string, user: User) => {
      prescription_id = '12345678'
      return {
          "_id": prescription_id,
          "medicalRecord": "6400b3815bf4070503a7fb28",
          "patient_demographics": {
            "firstName": "Amyyy",
            "lastName": "Woodsss",
            "email": "testuser11@gmail.com",
            "age": 24,
            "address": "Spain",
            "telephone": "53950954"
          },
          "prescriber": {
            "doctor_firstName": "Clark",
            "doctor_lastName": "Peterson",
            "doctor_department": "Cardiology",
            "doctor_email": "testuser5@gmail.com",
            "doctor_telephone": "12121212"
          },
          "medications": [
            {
              "name": "Paracetamol",
              "dosage": "two tablets",
              "duration": "5 days",
              "frequency": "twice daily",
              "routeOfAdministration": "Oral"
            },
            {
              "name": "Ampliclox",
              "dosage": "two tablets",
              "duration": "2 years",
              "frequency": "thrice weekly",
              "routeOfAdministration": "Injection"
            }
          ],
          "instructions": "Drink water and rest a lot. Have fun too",
          "createdAt": "2023-03-02T14:32:57.341Z",
          "__v": 1

      }
    } ),

  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PrescriptionController],
      providers: [
        {
          provide: PrescriptionService,
          useValue: mockPrescriptionService
        }
      ]
    }).compile();

    controller = module.get<PrescriptionController>(PrescriptionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return an encrypted prescription', async() => {
    const user = {email: "testadmin@gmail.com", password: "testpass123", role: Role.Admin, category: UserCategory.MedicalProvider}
    const mockRequest = { body: user } as Request
    const instructions = "Drink water and rest a lot. Have fun too"
    const medications = [
      {
        "name": "Paracetamol",
        "dosage": "two tablets",
        "routeOfAdministration": RouteOfAdministration.Oral,
        "frequency": "twice daily",
        "duration": "5 days"
      },
      {
        "name": "Ampliclox",
        "dosage": "two tablets",
        "routeOfAdministration": RouteOfAdministration.Oral,
        "frequency": "thrice weekly",
        "duration": "2 years"
      }
    ]
    expect( await controller.addPrescriptionToMedicalRecord( '12345678', 
      {
        medications: medications,
        instructions: instructions
      }, 
      mockRequest ) ).toEqual(mockPrescriptionService.addPrescriptionToMedicalRecord( '12345678', user, medications, instructions ))
  })

  it('should return prescriptions of logged in patient', async() => {
    const user = {email: "testuser2@gmail.com", password: "testpass123", role: Role.User, category: UserCategory.Patient}
    const mockRequest = { body: user } as Request
    expect( await controller.getPrescriptionsOfLoggedInPatient(mockRequest) ).toEqual( mockPrescriptionService.getPrescriptionsOfLoggedInPatient(user) )
  })

  it('should return a prescription by id', async () => {
    const user = {email: "testuser2@gmail.com", password: "testpass123", role: Role.User, category: UserCategory.Patient}
    const mockRequest = { body: user } as Request
    expect (await (await controller.getPrescriptionByID('12345678', mockRequest))._id).toEqual('12345678')
    expect( await controller.getPrescriptionByID('12345678', mockRequest) ).toEqual(mockPrescriptionService.getPrescriptionByID('12345678', user))
  })
});
