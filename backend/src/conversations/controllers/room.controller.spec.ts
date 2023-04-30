import { Test, TestingModule } from '@nestjs/testing';
import { RoomController } from './room.controller';
import {RoomService} from '../services/room.service'


describe('RoomController', () => {
  let controller: RoomController;

  let mockRoomService = {}

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
});
