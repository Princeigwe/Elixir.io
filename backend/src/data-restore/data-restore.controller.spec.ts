import { Test, TestingModule } from '@nestjs/testing';
import { DataRestoreController } from './data-restore.controller';

describe('DataRestoreController', () => {
  let controller: DataRestoreController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DataRestoreController],
    }).compile();

    controller = module.get<DataRestoreController>(DataRestoreController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
