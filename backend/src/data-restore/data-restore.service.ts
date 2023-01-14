import { Injectable } from '@nestjs/common';
import {exec} from 'node:child_process'

// this service restores already saved data from the backup database. It does NOT restore deleted data that ahs not been backed up

@Injectable()
export class DataRestoreService {

    dataRestore() {
        if (process.env.NODE_ENV=='development') {
            exec('sh ./src/bash_scripts/localDataRestore.sh ', (error, stdout, stderr) => {
            
            
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

        return { message: "Data restoration in process..." }
    }
}
