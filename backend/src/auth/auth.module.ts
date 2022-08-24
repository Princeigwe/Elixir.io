import { Module, forwardRef } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import {UsersModule} from '../users/users.module'
import {LocalStrategy} from './strategies/local.strategy'

@Module({
  imports: [UsersModule], 
  providers: [AuthService, LocalStrategy],
  controllers: [AuthController]
})
export class AuthModule {}
