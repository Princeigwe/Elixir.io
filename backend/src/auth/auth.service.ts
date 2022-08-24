import { Injectable } from '@nestjs/common';
import {UsersService} from '../users/users.service'

import { createCipheriv, randomBytes, scrypt } from 'crypto'
import { promisify } from 'util';

// steps to encrypt the password
const initVector = randomBytes(16); // used to generate 16 bytes of random data
const password = "user password"
const secretKey = randomBytes(32); // used to generate 32 bytes of random data as secret key
const algorithm = 'aes-256-cbc' // the algorithm for encrypting the data

const cipher = createCipheriv(algorithm, secretKey, initVector) // the cipher function
let encryptedPassword = cipher.update(password, "utf-8", "hex"); // encrypting the password
encryptedPassword += cipher.final("hex"); // stopping the encryption process

@Injectable()
export class AuthService {
    constructor(private userService: UsersService) {}

    async registerUser(email: string, password: string) {
        // steps to encrypt the password
        const initVector = randomBytes(16); // used to generate 16 bytes of random data
        const secretKey = randomBytes(32); // used to generate 32 bytes of random data as secret key
        const algorithm = 'aes-256-cbc' // the algorithm for encrypting the data

        const cipher = createCipheriv(algorithm, secretKey, initVector) // the cipher function
        let encryptedPassword = cipher.update(password, "utf-8", "hex"); // encrypting the password
        encryptedPassword += cipher.final("hex"); // stopping the encryption process

        return this.userService.createUser(email, encryptedPassword)
    }


    async validateUser() {}
}
