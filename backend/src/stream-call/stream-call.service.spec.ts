import { Test, TestingModule } from '@nestjs/testing';
import { StreamCallService } from './stream-call.service';
import { getModelToken } from '@nestjs/mongoose';


describe('StreamCallService', () => {
  let service: StreamCallService;

  function mockSessionModel (dto:any) {
    this.data = dto
    this.save = () => {return this.data}
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StreamCallService,
        {provide: getModelToken('Session'), useValue: mockSessionModel}
      ],
    }).compile();

    service = module.get<StreamCallService>(StreamCallService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
