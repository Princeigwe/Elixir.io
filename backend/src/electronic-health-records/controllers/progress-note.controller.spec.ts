import { Test, TestingModule } from '@nestjs/testing';
import { ProgressNoteController } from './progress-note.controller';

describe('ProgressNoteController', () => {
  let controller: ProgressNoteController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProgressNoteController],
    }).compile();

    controller = module.get<ProgressNoteController>(ProgressNoteController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
