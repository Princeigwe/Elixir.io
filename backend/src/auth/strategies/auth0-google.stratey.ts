import {Injectable} from '@nestjs/common'   
import { PassportStrategy } from '@nestjs/passport'
import { Strategy } from 'passport-auth0'


@Injectable()
export class Auth0GoogleStrategy extends PassportStrategy(Strategy, 'auth0-google') { // setting Passport to use auth0 strategy
    constructor() {
        // calling the parameters of auth0 strategy
        super({
            domain: process.env.AUTH0_DOMAIN,
            clientID: process.env.AUTH0_CLIENT_ID,
            clientSecret: process.env.AUTH0_CLIENT_SECRET,
            callbackURL: `${process.env.API_DOMAIN}api/v1/auth/google-callback`,
            scope: 'openid email profile',
            connection: 'google-oauth2' // using google identity provider connection
        })
    }

    // extracting user profile after validating access token
    async validate(accessToken: string, refreshToken: string, extraParams: string, profile: any) { 
        console.log(`Google user profile: ${profile}`)
        const { name, picture, email } = profile // destructuring profile that will be user gotten after oauth process
        return { name, picture, email }
    }
}