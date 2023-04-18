import { Test, TestingModule } from '@nestjs/testing';
import { ConversationsGateway } from './conversations.gateway';

describe('ConversationsGateway', () => {
  let gateway: ConversationsGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConversationsGateway],
    }).compile();

    gateway = module.get<ConversationsGateway>(ConversationsGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
