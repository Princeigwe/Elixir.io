import { Module } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Appointment, AppointmentSchema } from './appointment.schema';
import { AppointmentsController } from './appointments.controller';
import { ProfilesModule } from '../profiles/profiles.module';

@Module({
  imports: [
    ProfilesModule,
    MongooseModule.forFeature([
      {name: Appointment.name, schema: AppointmentSchema}
    ])
  ],
  providers: [AppointmentsService],
  controllers: [AppointmentsController]
})
export class AppointmentsModule {}
