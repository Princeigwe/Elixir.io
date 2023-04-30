import { Test, TestingModule } from '@nestjs/testing';
import { MessageService } from './message.service';
import { RoomService } from './room.service';
import { getModelToken } from '@nestjs/mongoose';


describe('MessageService', () => {
  let service: MessageService;

  function mockMessageModel (dto:any) {
    this.data = dto
    this.save = () => {return this.data}
  }

  let mockRoomService = {}

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessageService,
        {provide: RoomService, useValue: mockRoomService},
        {provide: getModelToken('Message'), useValue: mockMessageModel}
      ],
    }).compile();

    service = module.get<MessageService>(MessageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
