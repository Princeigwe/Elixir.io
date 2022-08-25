import { Injectable, HttpException, HttpStatus} from '@nestjs/common';
import {UsersService} from '../users/users.service'
import {JwtService} from '@nestjs/jwt'
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private userService: UsersService,
        private jwtService: JwtService // service that will sign a token to the authenticated user payload
    ) {}


    /**
     * The function takes in an email and password, generates a salt, hashes the password with the
     * salt, and then creates a user with the email and hashed password
     * @param {string} email - string, password: string
     * @param {string} password - The password that the user is trying to register with.
     * @returns The userService.createUser method is being returned.
     */
    async registerUser(email: string, password: string) {
        // steps to hashing user password 
        const salt = await bcrypt.genSalt(10) // generate salt
        const hashedPassword = await bcrypt.hash(password, salt) //hashing user password to salt
        return this.userService.createUser(email, hashedPassword)
    }

    // this method is responsible to register an admin
    async registerAdmin(email: string, password: string) {
        const salt = await bcrypt.genSalt(10) // generate salt
        const hashedPassword = await bcrypt.hash(password, salt) //hashing user password to salt
        return this.userService.createAdmin(email, hashedPassword)
    }


    /**
   * We're going to get a user by email, then we're going to compare the password that was passed in
   * with the hashed password that we got from the database. If they match, we'll return the user. If
   * they don't match, we'll throw an error
   * @param {string} email - the email of the user
   * @param {string} password - The password that the user entered in the login form.
   * @returns {
   *         "statusCode": 400,
   *         "message": "Invalid Credentials"
   *     }
   */
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

    /**
     * It takes a userId, creates a payload with the userId, signs the payload with the jwtService, and
     * returns the token in a cookie
     * @param {any} userId - any - this is the userId that is returned from the database.
     * @returns A cookie with the JWT token.
     */
    async putJwtInCookieOnLogin(userId: any) {
        const payload = { userId: userId }
        const token = this.jwtService.sign(payload)
        return `Authentication=${token}; HttpOnly; Path=/; Max-Age=120`;
    }
}
