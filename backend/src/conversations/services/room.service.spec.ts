import { Test, TestingModule } from '@nestjs/testing';
import { RoomService } from './room.service';
import { getModelToken } from '@nestjs/mongoose';


describe('RoomService', () => {
  let service: RoomService;

  function mockRoomModel (dto:any) {
    this.data = dto
    this.save = () => {return this.data}
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoomService,
        {provide: getModelToken('Room'), useValue: mockRoomModel}
      ],
    }).compile();

    service = module.get<RoomService>(RoomService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
