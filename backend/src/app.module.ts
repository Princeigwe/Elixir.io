import {MongooseModule} from '@nestjs/mongoose'
import { Module, CacheModule } from '@nestjs/common';
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
import { ElectronicHealthRecordsModule } from './electronic-health-records/electronic-health-records.module';
import { TokenModule } from './token/token.module';
import { ConversationsModule } from './conversations/conversations.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { StreamCallModule } from './stream-call/stream-call.module';

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
    DataRestoreModule,
    ElectronicHealthRecordsModule,
    TokenModule,
    ConversationsModule,
    AppointmentsModule,
    StreamCallModule,
    CacheModule.register({ 
      isGlobal: true, // make caching available to all modules
      ttl: 30000 // cached data time to live in milliseconds (30 seconds), because cache-manager used is of version 5
    })
  ],
  // controllers: [AppController],
  // providers: [AppService],
})
export class AppModule {}
