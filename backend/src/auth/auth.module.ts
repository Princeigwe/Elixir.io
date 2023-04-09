import { Module, forwardRef } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import {UsersModule} from '../users/users.module'
import {LocalStrategy} from './strategies/local.strategy'
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import {JwtStrategy} from './strategies/jwt.strategy'
import { ProfilesModule } from 'src/profiles/profiles.module';
import {MedicalDepartmentsModule} from '../medical-departments/medical-departments.module'
import {Auth0GoogleStrategy} from './strategies/auth0-google.strategy'

@Module({
  imports: [
    MedicalDepartmentsModule,
    ProfilesModule,
    UsersModule,
    PassportModule,
    JwtModule.register({ 
      secret: jwtConstants.secret, 
      signOptions: { 
        expiresIn: '86400s' // the signed jwt token will expire in 86400 seconds (1 day)
      },
    })
  ], 
  providers: [AuthService, LocalStrategy, JwtStrategy, Auth0GoogleStrategy ],
  controllers: [AuthController],
  exports: [AuthService]
})
export class AuthModule {}
