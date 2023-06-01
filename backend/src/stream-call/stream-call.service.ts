import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Session, SessionDocument } from './session.schema';
import { User } from '../users/users.schema';
const jwt = require('jsonwebtoken');
import axios from 'axios'


/* These lines of code are importing the `opentok` library and creating an instance of the `OpenTok`
class with the provided API key, secret, and options. The `opentok` instance is then used to create
sessions and generate tokens for stream calls. 

The timeout option is set to 60000 milliseconds, which is equivalent to 60 seconds. 
This means that if an API request takes longer than 60 seconds to receive a response from the OpenTok server, 
the request will be aborted and considered as timed out.
*/
// const OpenTok = require("opentok");
import * as OpenTok from 'opentok'
console.log(OpenTok)
// const opentok = new OpenTok(process.env.VONAGE_VIDEO_API_KEY || "12345", process.env.VONAGE_VIDEO_SECRET || "12345", { timeout: 60000});



@Injectable()
export class StreamCallService {
    constructor(
        @InjectModel(Session.name) private sessionModel: Model<SessionDocument>
    ) {}


    /**
     * This is an async function that configures daily domain settings for advanced chat and people UI
     * using the Daily API.
     * @param {boolean} [enable_advanced_chat] - A boolean property that, when set to true, enables
     * advanced chat features for end users. This includes the ability to use emoji reactions, an emoji
     * picker in the chat input form, and the ability to send a Giphy chat message.
     * @param {boolean} [enable_people_ui] - This parameter is a boolean property that, when set to
     * true, enables the People UI feature in the Daily.co video call platform. This feature adds a
     * People button in the call tray that reveals a People tab in the call sidebar. The tab lists all
     * participants, and next to each name indicates audio status
     * @returns the data from the response of a POST request to the Daily.co API with the specified
     * configurations for enabling advanced chat and people UI, and authenticated using a bearer token.
     */
    async configureDailyDomainByAdmin(
        enable_advanced_chat?: boolean, //Property that gives end users a richer chat experience. This includes:Emoji reactions to chat messages. Emoji picker in the chat input form. Ability to send a Giphy chat message
        enable_people_ui?: boolean, // When set to true, a People button in the call tray reveals a People tab in the call sidebar. The tab lists all participants, and next to each name indicates audio status and an option to pin the participant.
    ){
        const url = "https://api.daily.co/v1/"
        const token = process.env.DAILY_API_KEY
        const configurations = {enable_advanced_chat, enable_people_ui}

        try {
            const response = await axios.post(url, { properties: configurations}, {headers: {"Authorization": `Bearer ${token}`}})
            return response.data
        } catch (error) {
            throw error
        }
    }

    async getAppointmentDetailsBySessionByID(sessionID: string) {
        const session = await (await this.sessionModel.findById(sessionID)).populate('appointment')
        const appointment = session.appointment
        return appointment
    }


    async createDailySessionRoom(patientEmail: string, doctorEmail: string, appointment_id: string) {
        const session = await this.sessionModel.findOne({patientEmail: patientEmail, doctorEmail: doctorEmail}).exec()
        if(session) {
            await this.sessionModel.deleteOne({patientEmail: patientEmail, doctorEmail: doctorEmail})
        }
        const sessionRoom = await this.sessionModel.create({ patientEmail: patientEmail, doctorEmail: doctorEmail, appointment: appointment_id });
        await sessionRoom.save();
        const appointment = await this.getAppointmentDetailsBySessionByID(sessionRoom._id)
        const appointmentDate = new Date(appointment['date'])
        const appointmentStartTimeInSeconds = Math.floor(appointmentDate.getTime()) / 1000

        const appointmentDurationTime = appointment.duration
        const [hours, minutes] = appointmentDurationTime.split(":")

        appointmentDate.setHours( appointmentDate.getHours() + parseInt(hours, 10) )
        appointmentDate.setMinutes( appointmentDate.getMinutes() + parseInt(minutes, 10) )

        const appointmentEndTime = Math.floor(appointmentDate.getTime() / 1000)

        const url = "https://api.daily.co/v1/rooms/"
        const token = process.env.DAILY_API_KEY
        const options = {headers: {"Authorization": `Bearer ${token}`}}
        const data = {
            privacy: "private",
            properties: {
                start_audio_off: true, // When a participant first joins a meeting in a room, keep their microphone muted.
                start_video_off: true, // When a participant first joins a meeting in a room, keep their camera off.
                nbf: appointmentStartTimeInSeconds,
                exp: appointmentEndTime,
                eject_at_room_exp: true, // If there's a meeting going on at room exp time, end the meeting by kicking everyone out
            }
        }

        try {
            const response = await axios.post(url, data, options)
            return response.data
        } catch (error) {
            throw error
        }
    }


    async createMeetingTokenForDailyRoom(roomName: string, roomExp: number) {
        const url = "https://api.daily.co/v1/meeting-tokens/"
        const token = process.env.DAILY_API_KEY
        const options = {headers: {"Authorization": `Bearer ${token}`}}
        const data = {
            properties: {
                room_name: roomName,
                exp: roomExp
            }
        }

        try {
            const response = await axios.post(url, data, options)
            return response.data
        } catch (error) {
            throw error
        }
    }


    async createJsonWebTokenForOpenTokRESTCalls() {
        const payload = {
            iss: process.env.VONAGE_VIDEO_API_KEY,
            ist: 'project',
            iat: Math.floor(Date.now() / 1000), // current timestamp in seconds
            exp: Math.floor(Date.now() / 1000) + (3 * 60) // expire after 3 minutes
        };

        // using OpenTok API secret as the JWT secret key and sign payload as specified in the REST API docs
        const secretKey = process.env.VONAGE_VIDEO_SECRET

        const token = jwt.sign(payload, secretKey)
        return token
    }


    /**
     * This function creates a new session for a patient and a doctor using OpenTok and saves it to a
     * database.
     * @param {string} patientEmail - A string representing the email address of the patient who is
     * participating in the session.
     * @param {string} doctorEmail - The email address of the doctor who will be participating in the
     * session.
     * @returns A Promise that resolves to a SessionDocument object.
     */

    // async createSession(patientEmail: string, doctorEmail: string, appointment_id: string) {
    //     const opentok = new OpenTok(process.env.VONAGE_VIDEO_API_KEY || "12345", process.env.VONAGE_VIDEO_SECRET || "12345", { timeout: 60000});

    // }

    //todo: look at this later
    async createSession(patientEmail: string, doctorEmail: string, appointment_id: string): Promise<SessionDocument> {
        const opentok = new OpenTok(process.env.VONAGE_VIDEO_API_KEY || "12345", process.env.VONAGE_VIDEO_SECRET || "12345", { timeout: 60000});
        const session = await this.sessionModel.findOne({patientEmail: patientEmail, doctorEmail: doctorEmail}).exec()
        if(session) {
            await this.sessionModel.deleteOne({patientEmail: patientEmail, doctorEmail: doctorEmail})
        }
        return new Promise<SessionDocument>((resolve, reject) => {
            opentok.createSession({ mediaMode: "routed" }, async (error, session) => {
                if (error) {
                console.log("Error creating session:", error);
                reject(error);
                } 
                else {
                    try {
                        const sessionRoom = await this.sessionModel.create({ sessionID: session.sessionId, patientEmail: patientEmail, doctorEmail: doctorEmail, appointment: appointment_id });
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


    /**
    * This function generates a token for a stream call session with a specified expiration time based
    * on the appointment's schedule date and duration.
    * @param {string} sessionID - A string representing the ID of a session in OpenTok.
    * @returns a token generated by the OpenTok API for a given session ID, with an expiration time
    * based on the appointment's schedule date and duration.
    */

    //todo: look at this later
    async generateToken(sessionID: string) {
        const opentok = new OpenTok(process.env.VONAGE_VIDEO_API_KEY || "12345", process.env.VONAGE_VIDEO_SECRET || "12345", { timeout: 60000});
        const session = await this.sessionModel.findOne({ sessionID: sessionID}).populate('appointment').exec()
        const appointment = session.appointment
        const streamCallTokenExpirationDate = new Date(appointment['date'])
        const appointmentDurationTime = appointment.duration

        const [hours, minutes] = appointmentDurationTime.split(":")
        streamCallTokenExpirationDate.setHours( streamCallTokenExpirationDate.getHours() + parseInt(hours, 10) )
        streamCallTokenExpirationDate.setMinutes( streamCallTokenExpirationDate.getMinutes() + parseInt(minutes, 10) )

        const tokenExpirationTime = Math.floor(streamCallTokenExpirationDate.getTime() / 1000)
        const options = {expireTime: tokenExpirationTime}
        const token = opentok.generateToken(sessionID, options);
        return token
    }


}