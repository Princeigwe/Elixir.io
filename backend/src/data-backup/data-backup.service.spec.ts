import { Test, TestingModule } from '@nestjs/testing';
import { DataBackupService } from './data-backup.service';

describe('DataBackupService', () => {
  let service: DataBackupService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DataBackupService],
    }).compile();

    service = module.get<DataBackupService>(DataBackupService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
