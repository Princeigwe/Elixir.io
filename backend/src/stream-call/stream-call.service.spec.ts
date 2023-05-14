import { Test, TestingModule } from '@nestjs/testing';
import { StreamCallService } from './stream-call.service';

describe('StreamCallService', () => {
  let service: StreamCallService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StreamCallService],
    }).compile();

    service = module.get<StreamCallService>(StreamCallService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
