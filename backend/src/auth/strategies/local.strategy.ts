import {Strategy} from 'passport-local'
import { PassportStrategy } from '@nestjs/passport'
import { Injectable } from '@nestjs/common'
import {AuthService} from '../auth.service'

// Password Local strategy (email and password method) 
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(private authService: AuthService) {
        super({usernameField: 'email'}) // replacing the username field of the strategy with email for validation
    }

    // the validate() method of Passport LocalStrategy. 
    // This method uses the username and password fields by default, but this has been replace with "email".
    async validate(email: string, password: string) {
        const user = await this.authService.getValidatedUser(email, password)
        return user
    }
}