import { Controller, Get } from '@nestjs/common';
import {DataRestoreService} from './data-restore.service'
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags("Data Restoration")
@Controller('data-restore')
export class DataRestoreController {
    constructor(private dataRestoreService: DataRestoreService) {}

    @ApiOperation({description: "This endpoint restores data from the backup database in case of data loss"})
    @Get()
    async dataRestore() {
        return this.dataRestoreService.dataRestore()
    }
}
