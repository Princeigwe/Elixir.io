import { Test, TestingModule } from '@nestjs/testing';
import { DataRestoreController } from './data-restore.controller';
import { DataRestoreService } from './data-restore.service';

describe('DataRestoreController', () => {
  let controller: DataRestoreController;

  let mockDataRestoreService = {

    dataRestore: jest.fn( () => {
      return {
        message: "Data restoration in process..."
      }
    } ),

  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DataRestoreController],
      providers: [
        {
          provide: DataRestoreService,
          useValue: mockDataRestoreService
        }
      ]
    }).compile();

    controller = module.get<DataRestoreController>(DataRestoreController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
  
  it('should return a response message', async() => {
    let response = {
          message: "Data restoration in process..."
        }
    expect(await controller.dataRestore()).toEqual(response);
  })

  it('should return a response message', async () => {
    expect(await controller.dataRestore()).toEqual(mockDataRestoreService.dataRestore())
  })
});
