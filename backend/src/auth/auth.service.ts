import { Injectable, HttpException, HttpStatus} from '@nestjs/common';
import {UsersService} from '../users/users.service'

import { createCipheriv, randomBytes, createDecipheriv, scrypt } from 'crypto'
import { promisify } from 'util';

// variables responsible for encrypting password during user registration

const initVector = randomBytes(16); // used to generate 16 bytes of random data
const secretKey = randomBytes(32); // used to generate 32 bytes of random data as secret key
const algorithm = 'aes-256-cbc' // the algorithm for encrypting the data
@Injectable()
export class AuthService {
    constructor(private userService: UsersService) {}

    /**
     * It takes an email and password, encrypts the password, and then creates a user with the email
     * and encrypted password
     * @param {string} email - the email of the user
     * @param {string} password - the password that the user entered
     * @returns The userService.createUser function is being returned.
     */
    async registerUser(email: string, password: string) {
        // steps to encrypt the password
        const cipher = createCipheriv(algorithm, secretKey, initVector) // the cipher function
        let encryptedPassword = cipher.update(password, "utf-8", "hex"); // encrypting the password
        encryptedPassword += cipher.final("hex"); // stopping the encryption process
        
        return this.userService.createUser(email, encryptedPassword)
    }



    /**
     * It takes in an email and password, gets the user from the database, decrypts the password, and
     * compares it to the password that was passed in. If they match, it returns the user. If they
     * don't match, it throws an error
     * @param {string} email - The email of the user
     * @param {string} password - The password to be encrypted.
     * @returns The user is being returned.
     */
    async getValidatedUser(email: string, password: string) {
        const user = await this.userService.getUserByEmail(email)
        let encryptedPassword = user.password

        // to check if the login password is decrypted encryptedPassword
        const decipher = createDecipheriv(algorithm, secretKey, initVector); // decipher function
        let decryptedPassword = decipher.update(encryptedPassword, "hex", "utf-8") //decrypting password
        decryptedPassword += decipher.final("utf8"); // stopping decryption process

        if (decryptedPassword == password) {
            return user
        }else{
            throw new HttpException('Invalid Credentials', HttpStatus.BAD_REQUEST) 
        }

    }
}
