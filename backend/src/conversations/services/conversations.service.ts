import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../../users/users.service';
import { WsException } from '@nestjs/websockets';
import {TokenExpiredError} from 'jsonwebtoken'
import { RoomService } from './room.service';

@Injectable()
export class ConversationsService {
    constructor(
        private jwtService: JwtService,
        private usersService: UsersService,
        private roomsService: RoomService
    ) {}

    // this method will fetch the authorization header of the request making the websocket handshake
    async getUserDetailsAfterWebsocketHandShake(jwt: string) {
        const decodedPayload = await this.jwtService.verify(jwt) 
        const user = await this.usersService.getUserByIDForJwt(decodedPayload.userId)
        return user
    }

    /**
     * This function checks if a user belongs to a conversation room based on their JWT and the socket
     * room name.
     * @param {string} jwt - A JSON Web Token (JWT) that contains information about the user, such as
     * their user ID and expiration time.
     * @param {string} socketRoom - The `socketRoom` parameter is a string representing the name of a
     * conversation room.
     * @returns a boolean value indicating whether the user identified by the JWT belongs to the
     * conversation room identified by the socketRoom parameter. The function returns true if the
     * user's email matches either the patientEmail or medicalProviderEmail of the conversation room,
     * and the JWT is not expired. Otherwise, it returns false.
     */
    async checkIfUserBelongsToConversationRoom(jwt: string, socketRoom: string) { 
        const decodedPayload = await this.jwtService.decode(jwt) 
        const user = await this.usersService.getUserByIDForJwt(decodedPayload['userId'])
        const room = await this.roomsService.getConversationRoomByName(socketRoom)

        // checking if jwt is not expired
        if( decodedPayload['exp'] > Date.now() / 1000 ) {
            if(user.email == room.patientEmail || user.email == room.medicalProviderEmail) {
                return true
            }
            else {
                return false
            }
        }

        else{
            return false
        }
    }
}
