import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Session, SessionDocument } from './session.schema';
import { User } from '../users/users.schema';
const jwt = require('jsonwebtoken');
import axios from 'axios'
import * as AesEncryption from 'aes-encryption'


const aes = new AesEncryption()
aes.setSecretKey(process.env.ENCRYPTION_KEY || '11122233344455566677788822244455555555555555555231231321313aaaff')



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
        const session = await this.sessionModel.findOne({patientEmail: aes.encrypt(patientEmail), doctorEmail: aes.encrypt(doctorEmail)}).exec()
        if(session) {
            await this.sessionModel.deleteOne({patientEmail: aes.encrypt(patientEmail), doctorEmail: aes.encrypt(doctorEmail)})
        }
        const sessionRoom = await this.sessionModel.create({ patientEmail: aes.encrypt(patientEmail), doctorEmail: aes.encrypt(doctorEmail), appointment: appointment_id });
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
            return response.data.token
        } catch (error) {
            throw error
        }
    }


}