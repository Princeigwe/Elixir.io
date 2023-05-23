import { Test, TestingModule } from '@nestjs/testing';
import { StreamCallController } from './stream-call.controller';

describe('StreamCallController', () => {
  let controller: StreamCallController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StreamCallController],
    }).compile();

    controller = module.get<StreamCallController>(StreamCallController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
