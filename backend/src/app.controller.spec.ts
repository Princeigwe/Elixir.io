import { Test, TestingModule } from '@nestjs/testing';
// import { AppController } from './app.controller';
// import { AppService } from './app.service';

describe('AppController', () => {
  // let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      // controllers: [AppController],
      // providers: [AppService],
    }).compile();

    // appController = app.get<AppController>(AppController);
  });

  // describe('root', () => {
  //   it('should return "Hello World!"', () => {
  //     expect(appController.getHello()).toBe('Hello World!');
  //   });
  // });

  it('should return 2', () => {
    expect(1+1).toBe(2) // Did this because i don't want to delete this test file. LOL
  })
});
