import { Test, TestingModule } from '@nestjs/testing';
import { RoomController } from './room.controller';
import {RoomService} from '../services/room.service'
import { User } from '../../users/users.schema';
import {UserCategory} from '../../enums/user.category.enum'
import {Role} from '../../enums/role.enum'


describe('RoomController', () => {
  let controller: RoomController;

  let mockRoomService = {
    getConversationRoomsOfLoggedInPatientOrMedicalProvider: jest.fn((user: User) => {
      return [
        {
          "_id": "64403b732e49345c4e804555",
          "name": "testuser5mailinator.com+testuser5gmail.com",
          "patientEmail": "testuser5@mailinator.com",
          "medicalProviderEmail": "testuser5@gmail.com",
          "__v": 0
        }
      ]
    })
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoomController],
      providers: [
        { provide: RoomService, useValue: mockRoomService}
      ]
    }).compile();

    controller = module.get<RoomController>(RoomController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return conversation rooms of the user', async () => {
    const user = {email: "testadmin@gmail.com", password: "testpass123", role: Role.Admin, category: UserCategory.MedicalProvider}
    expect(await controller.getConversationRoomsOfLoggedInPatientOrMedicalProvider(user)).toEqual(mockRoomService.getConversationRoomsOfLoggedInPatientOrMedicalProvider(user))
  })
});
