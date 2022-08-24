import { Injectable, HttpException, HttpStatus} from '@nestjs/common';
import {UsersService} from '../users/users.service'

import { createCipheriv, randomBytes, createDecipheriv, scrypt } from 'crypto'
import {JwtService} from '@nestjs/jwt'
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private userService: UsersService,
        private jwtService: JwtService // service that will sign a token to the authenticated user payload
    ) {}


    async registerUser(email: string, password: string) {
        // steps to hashing user password 
        const salt = await bcrypt.genSalt(10) // generate salt
        const hashedPassword = await bcrypt.hash(password, salt) //hashing user password to salt
        return this.userService.createUser(email, hashedPassword)
    }



    async getValidatedUser(email: string, password: string) {
        const user = await this.userService.getUserByEmail(email)

        // steps to validate hashedPassword
        const hashedPassword = user.password
        const validPassword = await bcrypt.compare(password, hashedPassword)
        if(validPassword) {
            return user
        }else{
            throw new HttpException('Invalid Credentials', HttpStatus.BAD_REQUEST) 
        }

    }

    async putJwtInCookieOnLogin(userId: any) {
        const payload = { userId: userId }
        const token = this.jwtService.sign(payload)
        return `Authentication=${token}; HttpOnly; Path=/; Max-Age=120`;
    }
}
