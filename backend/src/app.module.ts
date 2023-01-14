import {MongooseModule} from '@nestjs/mongoose'
import { Module } from '@nestjs/common';
// import { AppController } from './app.controller';
// import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ProfilesModule } from './profiles/profiles.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { MedicalDepartmentsModule } from './medical-departments/medical-departments.module';
import { CaslModule } from './casl/casl.module';
import { ScheduleModule } from '@nestjs/schedule';
import { DataBackupModule } from './data-backup/data-backup.module';
import { DataRestoreModule } from './data-restore/data-restore.module';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_DATABASE_URI),
    UsersModule,
    AuthModule,
    ProfilesModule,
    EventEmitterModule.forRoot(),
    MedicalDepartmentsModule,
    CaslModule,
    ScheduleModule.forRoot(),
    DataBackupModule,
    DataRestoreModule
  ],
  // controllers: [AppController],
  // providers: [AppService],
})
export class AppModule {}
