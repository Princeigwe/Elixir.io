import { Module } from '@nestjs/common';
import { DataBackupService } from './data-backup.service';

@Module({
  providers: [DataBackupService]
})
export class DataBackupModule {}
