import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Session, SessionDocument } from './session.schema';


const OpenTok = require("opentok");
const opentok = new OpenTok(process.env.VONAGE_VIDEO_API_KEY, process.env.VONAGE_VIDEO_SECRET, { timeout: 60000});



@Injectable()
export class StreamCallService {
    constructor(
        @InjectModel(Session.name) private sessionModel: Model<SessionDocument>
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


    async generateToken(patientEmail: string, doctorEmail: string) {
        const sessionRoom = await this.createSession(patientEmail, doctorEmail);
        const token = opentok.generate(sessionRoom.sessionID);
        return token
    }


}