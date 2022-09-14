import {MongooseModule} from '@nestjs/mongoose'
import { Module } from '@nestjs/common';
// import { AppController } from './app.controller';
// import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ProfilesModule } from './profiles/profiles.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { MedicalDepartmentsModule } from './medical-departments/medical-departments.module';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_DATABASE_URI),
    UsersModule,
    AuthModule,
    ProfilesModule,
    EventEmitterModule.forRoot(),
    MedicalDepartmentsModule
  ],
  // controllers: [AppController],
  // providers: [AppService],
})
export class AppModule {}
