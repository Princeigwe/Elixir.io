import { Test, TestingModule } from '@nestjs/testing';
import { DataRestoreService } from './data-restore.service';

describe('DataRestoreService', () => {
  let service: DataRestoreService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DataRestoreService],
    }).compile();

    service = module.get<DataRestoreService>(DataRestoreService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
