import { Test, TestingModule } from '@nestjs/testing';
import { MedicalDepartmentsController } from './medical-departments.controller';
import {MedicalDepartmentsService } from './medical-departments.service'

describe('MedicalDepartmentsController', () => {
  let controller: MedicalDepartmentsController;

  let mockMedicalDepartmentsService = {

    getMedicalDepartments: jest.fn( () => {
      return [
        {
          "_id": "631c169fa4a3eb36ed9ff734",
          "name": "Cardiology",
          "groups": [
            {
              "consultant": "Abraham Smith",
              "associateSpecialists": [
                "Matthew Woods",
                "Matt Stone"
              ],
              "juniorDoctors": [],
              "medicalStudents": []
            },
            {
              "consultant": "Amy Brown",
              "associateSpecialists": [
                "Nick Crook",
                "Smith Fraya"
              ],
              "juniorDoctors": [],
              "medicalStudents": []
            }
          ],
          "members": [
            "Abraham Smith",
            "Amy Brown",
            "Matthew Woods",
            "Matt Stone",
            "Nick Crook",
            "Smith Fraya"
          ],
          "__v": 0
        },
        {
          "_id": "631c16c7a4a3eb36ed9ff73b",
          "name": "Dermatology",
          "groups": [],
          "members": [],
          "__v": 0
        }
      ]
    }),


    searchMedicalDepartmentByName : jest.fn( (name: string) => {
      return {
        _id: "631c16c7a4a3eb36ed9ff73b",
        name: name,
        groups: [],
        members: [],
        __v: 0
      }
    } )
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MedicalDepartmentsController],
      providers: [
        {
          provide: MedicalDepartmentsService,
          useValue: mockMedicalDepartmentsService
        }
      ]
      
    }).compile();

    controller = module.get<MedicalDepartmentsController>(MedicalDepartmentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it( 'should return an array of hospital departments', async() => {
    let departments = [
      {
        "_id": "631c169fa4a3eb36ed9ff734",
        "name": "Cardiology",
        "groups": [
          {
            "consultant": "Abraham Smith",
            "associateSpecialists": [
              "Matthew Woods",
              "Matt Stone"
            ],
            "juniorDoctors": [],
            "medicalStudents": []
          },
          {
            "consultant": "Amy Brown",
            "associateSpecialists": [
              "Nick Crook",
              "Smith Fraya"
            ],
            "juniorDoctors": [],
            "medicalStudents": []
          }
        ],
        "members": [
          "Abraham Smith",
          "Amy Brown",
          "Matthew Woods",
          "Matt Stone",
          "Nick Crook",
          "Smith Fraya"
        ],
        "__v": 0
      },
      {
        "_id": "631c16c7a4a3eb36ed9ff73b",
        "name": "Dermatology",
        "groups": [],
        "members": [],
        "__v": 0
      }
    ]

    expect(await controller.getOrSearchMedicalDepartments()).toEqual(departments)
  })

  it('should search department by name', async () => {
    let department = { 
      "_id": "631c16c7a4a3eb36ed9ff73b",
        "name": "Dermatology",
        "groups": [],
        "members": [],
        "__v": 0
    }

    expect(await controller.getOrSearchMedicalDepartments('Dermatology')).toEqual(department)
  })
});
