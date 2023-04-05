import { Test, TestingModule } from '@nestjs/testing';
import { TokenController } from './token.controller';
import { TokenService } from './token.service';


describe('TokenController', () => {
  let controller: TokenController;

  let mockTokenService = { 
    sendForgotPasswordEmail: jest.fn((email: string) => {
      return {
        "message": "Email sent. If the email address exist, you will be prompted."
      }
    }),

    confirmPasswordReset: jest.fn((token: string, password: string, confirmPassword: string) => { 
      return {
        message: "Success. Your password has been reset. You can now log in to your account using your new password."
      }
    })
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TokenController],
      providers: [
        { provide: TokenService, useValue: mockTokenService}
      ]
    }).compile();

    controller = module.get<TokenController>(TokenController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return a message saying to check email', async( ) => {
    expect(await controller.sendForgotPasswordEmail({email: 'testuser@gmail.com'})).toEqual( mockTokenService.sendForgotPasswordEmail('testuser@gmail.com') )
  })

  it('should return a message saying password successfully changed', async( ) => {
    expect(await controller.confirmPasswordReset( {token:'abcdef12345', password:'testpass123', confirmPassword: 'testpass123'} )).toEqual( mockTokenService.confirmPasswordReset( 'abcdef12345', 'testpass123', 'testpass123' ) )
  })
});
