import { Test, TestingModule } from '@nestjs/testing';
import { ProgressNoteService } from './progress-note.service';

describe('ProgressNoteService', () => {
  let service: ProgressNoteService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProgressNoteService],
    }).compile();

    service = module.get<ProgressNoteService>(ProgressNoteService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
