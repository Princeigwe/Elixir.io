import { Test, TestingModule } from '@nestjs/testing';
import { DoctorController } from './doctor.controller';
import {DoctorService} from '../services/doctor.service'
import {MaritalStatus} from '../../enums/marital.status.enum'


describe('DoctorController', () => {
  let controller: DoctorController;

  let mockDoctorService = {

    getDoctorProfileById: jest.fn( (_id: string) => {
      return {
        _id: "6311006facc97637eed89309",
        user: "6311006facc97637eed89307",
        maritalStatus: "Single",
        specialties: [],
        certificates: [],
        hierarchy: "Medical Student",
        languages: [],
        department: 'Surgery',
        assignedPatients: [],
        __v: 0
      }
    }),

    getDoctorProfiles: jest.fn( () => {
      return [
        {
          _id: "1234567",
          user: "6311006facc97637eed89307",
          maritalStatus: "Single",
          specialties: [],
          certificates: [],
          hierarchy: "Medical Student",
          languages: [],
          department: 'Cardiology',
          assignedPatients: [],
          __v: 0
        },

        {
          _id: "12345678",
          user: "6311006facc97637eed89307",
          maritalStatus: "Single",
          specialties: [],
          certificates: [],
          hierarchy: "Medical Student",
          languages: [],
          department: 'Cardiology',
          assignedPatients: [],
          __v: 0
        },

      ]
    } ),

    deleteDoctorsProfiles: jest.fn( () => { 
      return {
        message: "Doctor profiles deleted"
      }
    } ),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DoctorController],
      providers: [
        {
          provide: DoctorService,
          useValue: mockDoctorService
        }
      ]
    }).compile();

    controller = module.get<DoctorController>(DoctorController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return doctor by id', async() => {
    let response = {
      "_id": "6311006facc97637eed89309",
      "user": "6311006facc97637eed89307",
      "maritalStatus": "Single",
      "specialties": [],
      "certificates": [],
      "hierarchy": "Medical Student",
      "languages": [],
      "department": "Surgery",
      "assignedPatients": [],
      "__v": 0
    }

    expect(await controller.getDoctorProfileById('6311006facc97637eed89309')).toEqual(response)
  })

  it('should return array of doctors', async () => {
    let response = [
      {
        "_id": "1234567",
        "user": "6311006facc97637eed89307",
        "maritalStatus": "Single",
        "specialties": [],
        "certificates": [],
        "hierarchy": "Medical Student",
        "languages": [],
        "department": "Cardiology",
        "assignedPatients": [],
        "__v": 0
      },
      {
        "_id": "12345678",
        "user": "6311006facc97637eed89307",
        "maritalStatus": "Single",
        "specialties": [],
        "certificates": [],
        "hierarchy": "Medical Student",
        "languages": [],
        "department": "Cardiology",
        "assignedPatients": [],
        "__v": 0
      }
    ]
    expect(await controller.getDoctorProfiles()).toMatchObject(response)
  })

  it('should return a delete message', async () => {
    let response = {
      "message": "Doctor profiles deleted"
    }

    expect(await controller.deleteDoctorsProfiles()).toEqual(response)
  })

});
