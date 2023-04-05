import { Module } from '@nestjs/common';
import { TokenService } from './token.service';
import { TokenController } from './token.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {ResetToken, ResetTokenSchema } from './token.schema'
import { UsersModule } from '../users/users.module';
import {AuthModule } from '../auth/auth.module'

@Module({
  imports: [
    MongooseModule.forFeature([
      {name: ResetToken.name, schema: ResetTokenSchema}
    ]),
    UsersModule,
    AuthModule
  ],
  providers: [TokenService],
  controllers: [TokenController]
})
export class TokenModule {}
