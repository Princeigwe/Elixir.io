import { Module, forwardRef } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Appointment, AppointmentSchema } from './appointment.schema';
import { AppointmentsController } from './appointments.controller';
import { ProfilesModule } from '../profiles/profiles.module';
import {StreamCallModule } from '../stream-call/stream-call.module';

@Module({
  imports: [
    ProfilesModule,
    StreamCallModule,
    MongooseModule.forFeature([
      {name: Appointment.name, schema: AppointmentSchema}
    ])
  ],
  providers: [AppointmentsService],
  exports: [AppointmentsService],
  controllers: [AppointmentsController]
})
export class AppointmentsModule {}
