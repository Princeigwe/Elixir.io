import { Module, forwardRef } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import {UsersModule} from '../users/users.module'
import {LocalStrategy} from './strategies/local.strategy'
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import {JwtStrategy} from './strategies/jwt.strategy'

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({ 
      secret: jwtConstants.secret, 
      signOptions: { 
        expiresIn: '120s' // the signed jwt token will expire in 120 minutes
      },
    })
  ], 
  providers: [AuthService, LocalStrategy, JwtStrategy],
  controllers: [AuthController]
})
export class AuthModule {}
