import { Module, forwardRef } from '@nestjs/common';
import { StreamCallService } from './stream-call.service';
import { MongooseModule } from '@nestjs/mongoose';
import {Session, SessionSchema } from './session.schema'
import { StreamCallController } from './stream-call.controller';
import { ProfilesModule} from '../profiles/profiles.module';

@Module({
    imports: [
        ProfilesModule,
        MongooseModule.forFeature([
            {name: Session.name, schema: SessionSchema}
        ])
    ],
    providers: [StreamCallService],
    exports: [StreamCallService],
    controllers: [StreamCallController]
})
export class StreamCallModule {}
