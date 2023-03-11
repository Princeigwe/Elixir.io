import { Test, TestingModule } from '@nestjs/testing';
import { DoctorController } from './doctor.controller';
import {DoctorService} from '../services/doctor.service'
import {MaritalStatus} from '../../enums/marital.status.enum'


describe('DoctorController', () => {
  let controller: DoctorController;

  let mockDoctorService = {

    getDoctorProfileById: jest.fn( (_id: string) => {
      _id = '1234567'
      return {
        _id: _id,
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
          firstName: "Mike",
          lastName: "Faraday",
          email: "testuser3@gmail.com",
          address: "Abujs",
          telephone: "08100002222",
          maritalStatus: "Single",
          specialties: [],
          certificates: [],
          hierarchy: "Consultant",
          languages: [],
          department: "Dermatology",
          assignedPatients: [],
        },

        {
          _id: "12345678",
          user: "6311006facc97637eed89307",
          firstName: "Mike",
          lastName: "Faraday",
          email: "testuser3@gmail.com",
          address: "Abuja",
          telephone: "08100002222",
          maritalStatus: "Married",
          specialties: [],
          certificates: [],
          hierarchy: "Consultant",
          languages: [],
          department: "Cardiology",
          assignedPatients: [],
          __v: 0
        },

      ]
    } ),

    // deleteDoctorsProfiles: jest.fn( () => { 
    //   return {
    //     message: "Doctor profiles deleted"
    //   }
    // } ),
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
    expect(await controller.getDoctorProfileById('1234567')).toEqual(mockDoctorService.getDoctorProfileById('1234567'))
  })

  it('should return array of doctors', async () => {
    expect(await controller.getDoctorProfiles()).toMatchObject(mockDoctorService.getDoctorProfiles())
  })

  // it('should return a delete message', async () => {
  //   let response = {
  //     "message": "Doctor profiles deleted"
  //   }

  //   expect(await controller.deleteDoctorsProfiles()).toEqual(response)
  // })

});
