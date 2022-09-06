import {Injectable, NotFoundException} from '@nestjs/common'
import {ExtractJwt, Strategy} from 'passport-jwt'
import {PassportStrategy} from '@nestjs/passport'
import { jwtConstants } from '../constants'
import { UsersService } from '../../users/users.service'




@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private usersService: UsersService
    ){
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // this extracts the jwt from the request header
            ignoreExpiration: false, // don't ignore expiration of jwt
            secretOrKey: jwtConstants.secret
        })
    }

    async validate(payload: any) { // not really sure what this method does
        const user = this.usersService.getUserByIDForJwt(payload.userId)
        return user
    }
}