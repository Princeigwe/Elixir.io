import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import {exec} from 'node:child_process'


@Injectable()
export class DataBackupService {

    // run the backup task on every saturdays and sundays
    @Cron(CronExpression.EVERY_WEEKEND)
    backup() {
        if (process.env.NODE_ENV=='development') {
            exec('sh ./src/bash_scripts/localDataBackup.sh ', (error, stdout, stderr) => {
                if(error) {
                    console.log(`error: ${error.message}`)
                    return;
                }
                if(stderr) {
                    console.error(`stderr: ${stderr}`)
                    return
                }
                console.log(`stdout: \n${stdout}`)
            })
        }
        console.log("Backup task about to be executed...")
    }
}
