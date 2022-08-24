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

    async registerUser(email: string, password: string) {
        // steps to encrypt the password
        const cipher = createCipheriv(algorithm, secretKey, initVector) // the cipher function
        let encryptedPassword = cipher.update(password, "utf-8", "hex"); // encrypting the password
        encryptedPassword += cipher.final("hex"); // stopping the encryption process
        
        return this.userService.createUser(email, encryptedPassword)
    }



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
            throw new HttpException('User with this email already exists', HttpStatus.BAD_REQUEST) 
        }

    }
}
