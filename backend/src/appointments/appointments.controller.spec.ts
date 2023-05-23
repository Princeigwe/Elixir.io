import { Test, TestingModule } from '@nestjs/testing';
import { AppointmentsController } from './appointments.controller';
import { AppointmentsService } from './appointments.service';
import {AppointmentType} from '../enums/appointment.type.enum'
import { User } from '../users/users.schema';
import {Role} from '../enums/role.enum'
import {UserCategory} from '../enums/user.category.enum'
import { Request } from 'express';



describe('AppointmentsController', () => {
  let controller: AppointmentsController;

  let mockAppointmentsService = {

    scheduleAppointment: jest.fn( (user: User, date: Date, duration: string, description?: string, type?: AppointmentType) => {
      date = new Date("2023-05-22T20:40:00.000Z")
      description = 'headache'
      duration = "00:02"
      type = AppointmentType.Virtual
      return {
        "patient": {
          "firstName": "Connor",
          "lastName": "Williams",
          "email": "testuser4@mailinator.com"
        },
        "doctor": {
          "name": "Matthew Cage",
          "email": "testuser3@mailinator.com"
        },
        "_id": "646b8af810503b4dd7e4c2b0",
        "date": date,
        "status": "scheduled",
        "description": description,
        "type": type,
        "duration": duration,
        "isValid": true,
        "__v": 0
      }
    } ),

    rescheduleAppointmentByPatient: jest.fn( (appointment_id: string, user: User, date: Date) => {
      appointment_id = "12212121212"
      date = new Date("2023-05-22T20:40:00.000Z")

      return {
        message: "Appointment with your doctor has successfully been rescheduled."
      }
    } ),

    confirmAppointmentByMedicalProvider: jest.fn( (appointment_id: string, user: User) => {
      appointment_id = "1212121212"
      return {
        "patient": {
          "firstName": "Connor",
          "lastName": "Williams",
          "email": "testuser4@mailinator.com"
        },
        "doctor": {
          "name": "Matthew Cage",
          "email": "testuser3@mailinator.com"
        },
        "_id": appointment_id,
        "date": "2023-05-22T13:40:00.000Z",
        "status": "confirmed",
        "description": "headache",
        "type": "virtual",
        "duration": "00:02",
        "isValid": true,
        "__v": 0
      }
    })

  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppointmentsController],
      providers: [
        {
          provide: AppointmentsService, useValue: mockAppointmentsService
        }
      ]
    }).compile();

    controller = module.get<AppointmentsController>(AppointmentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return a scheduled appointment', async() => {
    const user = {email: "testuser3@mailinator.com", password: "testpass123", role: Role.User, category: UserCategory.Patient}
    const mockRequest = { body: user } as Request
    const date = new Date("2023-05-22T20:40:00.000Z")
    const body = {
      date : date,
      description : 'headache',
      duration : "00:02",
      type : AppointmentType.Virtual
    }
    expect(await controller.scheduleAppointment(mockRequest, body)).toEqual(mockAppointmentsService.scheduleAppointment(user, date, "00:22"))
  })

  it('should return a message after rescheduling', async() => {
    const user = {email: "testuser3@mailinator.com", password: "testpass123", role: Role.User, category: UserCategory.Patient}
    const mockRequest = { body: user } as Request
    const appointment_id = "12212121212"
    const date = new Date("2023-05-22T20:40:00.000Z")
    const body = {
      date: date
    }
    expect(await controller.rescheduleAppointmentByPatient(mockRequest, appointment_id, body)).toEqual(mockAppointmentsService.rescheduleAppointmentByPatient(appointment_id, user, date))
  })

  it('should return appointment after confirmation by medical provider', async() => {
    const user = {email: "testuser3@mailinator.com", password: "testpass123", role: Role.User, category: UserCategory.MedicalProvider}
    const mockRequest = { body: user } as Request
    const appointment_id = "12212121212"
    expect(await controller.confirmAppointmentByMedicalProvider(mockRequest, appointment_id)).toEqual(mockAppointmentsService.confirmAppointmentByMedicalProvider(appointment_id, user))
  })

});
