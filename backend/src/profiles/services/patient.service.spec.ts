import { Test, TestingModule } from '@nestjs/testing';
import { PatientService } from './patient.service';
import {getModelToken} from '@nestjs/mongoose'
import {CaslAbilityFactory} from '../../casl/casl-ability.factory'
import {DoctorService} from './doctor.service'
import { EventEmitter2 } from '@nestjs/event-emitter';
import {MedicalDepartmentsService} from '../../medical-departments/medical-departments.service'
import {forwardRef, Inject} from '@nestjs/common'



describe('PatientService', () => {
  let service: PatientService;

  let mockCaslAbilityFactory = {}
  let mockDoctorService = {}
  let mockEventEmitter2 = {}
  let mockMedicalDepartmentsService = {}

  function mockPatientModel(dto:any) {
    this.data = dto;
    this.save  = () => { return this.data }
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PatientService,
        {
          provide: getModelToken('Patient'),
          useValue: mockPatientModel
        },
        {
          provide: CaslAbilityFactory,
          useValue: mockCaslAbilityFactory
        },
        {
          provide: DoctorService,
          useValue: mockDoctorService
        },
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter2
        },
        {
          provide: MedicalDepartmentsService,
          useValue: mockMedicalDepartmentsService
        }
      ],
    }).compile();

    service = module.get<PatientService>(PatientService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
