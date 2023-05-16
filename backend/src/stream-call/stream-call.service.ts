import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Session, SessionDocument } from './session.schema';
import { User } from '../users/users.schema';
import {PatientService} from '../profiles/services/patient.service'


const OpenTok = require("opentok");
const opentok = new OpenTok(process.env.VONAGE_VIDEO_API_KEY, process.env.VONAGE_VIDEO_SECRET, { timeout: 60000});



@Injectable()
export class StreamCallService {
    constructor(
        @InjectModel(Session.name) private sessionModel: Model<SessionDocument>,
        private patientService: PatientService
    ) {}


    /**
     * This function creates a new session for a patient and a doctor using OpenTok and saves it to a
     * database.
     * @param {string} patientEmail - A string representing the email address of the patient who is
     * participating in the session.
     * @param {string} doctorEmail - The email address of the doctor who will be participating in the
     * session.
     * @returns A Promise that resolves to a SessionDocument object.
     */
    async createSession(patientEmail: string, doctorEmail: string): Promise<SessionDocument> {
        return new Promise<SessionDocument>((resolve, reject) => {
            opentok.createSession({ mediaMode: "routed" }, async (error, session) => {
                if (error) {
                console.log("Error creating session:", error);
                reject(error);
                } 
                else {
                    try {
                        const sessionRoom = await this.sessionModel.create({ sessionID: session.sessionId, patientEmail, doctorEmail });
                        await sessionRoom.save();
                        console.log(sessionRoom);
                        resolve(sessionRoom);
                    } catch (error) {
                        console.log(error);
                        reject(error);
                    }
                }
            });
        });
    }


    // async getSessionDataAsPatient() {}


    async getSessionRoomAsPatient(user: User) {
        const sessionRoom = await this.sessionModel.findOne({'patientEmail': user.email})
        if(!sessionRoom) {
            throw new HttpException('Stream call session does not exist.', HttpStatus.NOT_FOUND)
        }
        return sessionRoom
    }


    async joinStreamCallAsPatient(user: User) {
        const patient = await this.patientService.getPatientProfileByEmail(user)
        const sessionRoom = await this.getSessionRoomAsPatient(user)
        const token = opentok.generateToken(sessionRoom.sessionID, {expireTime: new Date().getTime() / 1000 + 7 * 24 * 60 * 60});
        console.log(token)
        return {"sessionID": sessionRoom.sessionID, "token": token }
    }


    // async generateToken(patientEmail: string, doctorEmail: string) {
    //     const sessionRoom = await this.createSession(patientEmail, doctorEmail);
    //     const token = opentok.generateToken(sessionRoom.sessionID);
    //     return token
    // }

    async generateToken(sessionID: string) {
        const token = opentok.generateToken(sessionID);
        return token
    }


}