import { Module } from '@nestjs/common';
import { DataRestoreService } from './data-restore.service';
import { DataRestoreController } from './data-restore.controller';

@Module({
  providers: [DataRestoreService],
  controllers: [DataRestoreController]
})
export class DataRestoreModule {}
