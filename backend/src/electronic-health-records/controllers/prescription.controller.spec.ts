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
          "email"     : aes.encrypt("johnsmith@gmail.com"),
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

    getPrescriptionOfLoggedInPatient: jest.fn(  ),

    getPrescriptionByID: jest.fn(  ),

    filterPrescriptionsTiedToMedicalRecord: jest.fn(  ),

    getPrescriptions: jest.fn(  ),

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
});
