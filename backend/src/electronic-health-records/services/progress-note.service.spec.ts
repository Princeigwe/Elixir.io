import { Test, TestingModule } from '@nestjs/testing';
import { ProgressNoteService } from './progress-note.service';
import { getModelToken } from '@nestjs/mongoose';

describe('ProgressNoteService', () => {
  let service: ProgressNoteService;

  function mockProgressNoteModel (dto: any) {
    this.data = dto
    this.save = () => {return this.data}
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProgressNoteService,
        {
          provide: getModelToken('ProgressNote'),
          useValue: mockProgressNoteModel
        }
      ],
    }).compile();

    service = module.get<ProgressNoteService>(ProgressNoteService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
