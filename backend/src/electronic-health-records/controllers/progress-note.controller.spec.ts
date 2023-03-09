import { Test, TestingModule } from '@nestjs/testing';
import { ProgressNoteController } from './progress-note.controller';
import { ProgressNoteService } from '../services/progress-note.service';
import * as AesEncryption from 'aes-encryption'
import { User } from '../../users/users.schema';
import {UserCategory} from '../../enums/user.category.enum'
import {Role} from '../../enums/role.enum'

const aes = new AesEncryption()
aes.setSecretKey(process.env.ENCRYPTION_KEY || '11122233344455566677788822244455555555555555555231231321313aaaff')


describe('ProgressNoteController', () => {
  let controller: ProgressNoteController;

  let mockProgressNoteService = {

    createProgressNoteForMedicalRecord: jest.fn( (medical_record_id: string, subjectiveInformation: string, objectiveInformation: string, assessment: string, plan: string, progress: string, user: User) => {
      medical_record_id = "6405466ba1facf807b676ab2"
      subjectiveInformation = "the patient said she felt sharp pain in her lower abdomen"
      objectiveInformation = "I believe this is some complications with the surgery that was performed earlier"
      // assessment = null
      plan = "the whole team will have to perform another checkup on her"
      progress = "getting better"

      // user.email = "testuser@gmail.com"
      // user.password = "testpass123" 
      // user.role = Role.User
      // user.category = UserCategory.MedicalProvider
      
      return {
        "medical_record_id": medical_record_id,
        "patient_demographics": {
          "firstName" : aes.encrypt("John"),
          "lastName"  : aes.encrypt("Smith"),
          "email"     : aes.encrypt("johnsmith@gmail.com"),
          "age"       : 24,
          "address"   : aes.encrypt("London, UK"),
          "telephone" : aes.encrypt("9090909090")
        },

        "subjectiveInformation" : subjectiveInformation == undefined ? null : aes.encrypt(subjectiveInformation),
        "objectiveInformation"  : objectiveInformation  == undefined ? null : aes.encrypt(objectiveInformation),
        "assessment"            : assessment            == undefined ? null : aes.encrypt(assessment),
        "plan"                  : plan                  == undefined ? null : aes.encrypt(plan),
        "progress"              : aes.encrypt(progress),

        "issued_by": {
          "doctor_firstName"  : aes.encrypt("Matthew"),
          "doctor_lastName"   : aes.encrypt("Clark"),
          "doctor_department" : aes.encrypt("Cardiology"),
          "doctor_email"      : aes.encrypt("testuser@gmail.com"),
          "doctor_telephone"  : aes.encrypt("898989898")
        },
        "_id": "640546a9a1facf807b676ab8",
        "createdAt": "2023-03-06T01:49:29.800Z",
        "updatedAt": "2023-03-06T01:49:29.800Z",
        "__v": 0
      }
    } )

  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProgressNoteController],
      providers: [
        {
          provide: ProgressNoteService,
          useValue: mockProgressNoteService
        }
      ]
    }).compile();

    controller = module.get<ProgressNoteController>(ProgressNoteController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create and return an encrypted progress note', async () => {
    const user: User = {email: "testuser@gmail.com", password: "testpass123", role: Role.User, category: UserCategory.MedicalProvider}
    const medical_record_id = "6405466ba1facf807b676ab2"
    const subjectiveInformation = "the patient said she felt sharp pain in her lower abdomen"
    const objectiveInformation = "I believe this is some complications with the surgery that was performed earlier"
    const assessment: string = undefined
    const plan = "the whole team will have to perform another checkup on her"
    const progress = "getting better"

    expect(await controller.createProgressNoteForMedicalRecord(medical_record_id,
      { 
        subjectiveInformation: subjectiveInformation, 
        objectiveInformation: objectiveInformation, 
        plan: plan, 
        assessment: assessment, 
        progress: progress
      }, user)).toEqual(mockProgressNoteService.createProgressNoteForMedicalRecord(medical_record_id, subjectiveInformation, objectiveInformation, assessment, plan, progress, user))
  })
});
