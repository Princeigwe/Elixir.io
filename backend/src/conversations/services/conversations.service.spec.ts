import { Test, TestingModule } from '@nestjs/testing';
import { ConversationsService } from './conversations.service';
import { UsersService } from '../../users/users.service';
import { RoomService } from './room.service';
import { JwtService } from '@nestjs/jwt';



describe('ConversationsService', () => {
  let service: ConversationsService;

  let mockUsersService = {}
  let mockRoomService = {}
  let mockJwtService = {}

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConversationsService,
        {provide: RoomService, useValue: mockRoomService},
        {provide: UsersService, useValue: mockUsersService},
        {provide:JwtService, useValue: mockJwtService},
      ],
    }).compile();

    service = module.get<ConversationsService>(ConversationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
