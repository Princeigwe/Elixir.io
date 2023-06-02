import { Test, TestingModule } from '@nestjs/testing';
import { StreamCallController } from './stream-call.controller';
import { StreamCallService } from './stream-call.service';

describe('StreamCallController', () => {
  let controller: StreamCallController;

  let mockStreamCallService = {}

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {provide: StreamCallService, useValue: mockStreamCallService}
      ],
      controllers: [StreamCallController],
    }).compile();

    controller = module.get<StreamCallController>(StreamCallController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
