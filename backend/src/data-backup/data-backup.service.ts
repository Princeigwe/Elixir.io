import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import {exec} from 'node:child_process'
import { stderr, stdout } from 'node:process';
import { ObjectEncodingOptions } from 'node:fs';



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

        else {

            const env = {
                ELIXIR_PASSWORD: process.env.MONGO_ATLAS_ELIXIR_PASSWORD,
                ELIXIR_DATABASE: process.env.MONGO_ATLAS_ELIXIR_DATABASE,

                ELIXIR_BACKUP_PASSWORD: process.env.MONGO_ATLAS_ELIXIR_BACKUP_PASSWORD,
                ELIXIR_BACKUP_DATABASE: process.env.MONGO_ATLAS_ELIXIR_BACKUP_DATABASE
            };

            /* 
                running script with variables that will be used in the script. 
                this is done with the env option, and it must be named "env"
            */
            exec('sh ./src/bash_scripts/remoteDataBackup.sh ', { env }, (error, stdout, stderr) => {
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
