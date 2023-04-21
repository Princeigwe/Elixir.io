import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../../users/users.service';
import { WsException } from '@nestjs/websockets';
import {TokenExpiredError} from 'jsonwebtoken'

@Injectable()
export class ConversationsService {
    constructor(
        private jwtService: JwtService,
        private usersService: UsersService
    ) {}

    // this method will fetch the authorization header of the request making the websocket handshake
    async getUserDetailsAfterWebsocketHandShake(jwt: string) {
        const decodedPayload = await this.jwtService.verify(jwt) 
        // const user = await this.usersService.getUserByIDForJwt(decodedPayload.userId)
        // return user
        try {
            const user = await this.usersService.getUserByIDForJwt(decodedPayload.userId)
            return user
        } catch (error) {
            if(error instanceof TokenExpiredError) { 
                throw new WsException("Invalid Credentials as json web token is expired")
            }
        }
    }
}
