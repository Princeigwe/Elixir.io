import {Injectable} from '@nestjs/common'   
import { PassportStrategy } from '@nestjs/passport'
import { Strategy, VerifyCallback } from 'passport-auth0'



@Injectable()
export class Auth0GoogleStrategy extends PassportStrategy(Strategy, 'auth0-google') { // setting Passport to use auth0 strategy
    constructor() {
        // calling the parameters of auth0 strategy
        super({
            domain: process.env.AUTH0_DOMAIN,
            clientID: process.env.AUTH0_CLIENT_ID,
            clientSecret: process.env.AUTH0_CLIENT_SECRET,
            callbackURL: `${process.env.API_DOMAIN}api/v1/auth/patient/callback/auth0`,
            scope: 'openid email profile',
            connection: 'google-oauth2', // using google identity provider connection
            state: false
        })
    }

    // extracting user profile after validating access token
    async validate(accessToken: string, refreshToken: string, profile, done: VerifyCallback) { 
        // console.log(profile)
        // getting just the email value of the provided profile
        const user = {email: profile.emails[0].value}
        // console.log(user)
        return done(null, user)
    }
}