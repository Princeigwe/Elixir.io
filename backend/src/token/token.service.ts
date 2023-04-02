import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import {Model } from 'mongoose'
import { InjectModel } from '@nestjs/mongoose';
import {ResetToken, ResetTokenDocument} from './token.schema'
const crypto = require('crypto');
import {EmailSender} from '../email/transporter' 
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { AuthService } from '../auth/auth.service';
import * as AesEncryption from 'aes-encryption'

const aes = new AesEncryption()
aes.setSecretKey(process.env.ENCRYPTION_KEY || '11122233344455566677788822244455555555555555555231231321313aaaff')

const emailSender = new EmailSender()

@Injectable()
export class TokenService {
    constructor(
        @InjectModel(ResetToken.name) private resetTokenModel: Model<ResetTokenDocument>,
        private usersService: UsersService,
        private authService: AuthService
    ) {}

    /**
     * It generates a random string of 64 hexadecimal characters
     */
    async generateRandomTokenString() { return crypto.randomBytes(64).toString('hex') }


    async sendForgotPasswordEmail(email: string) {
        // check for existing reset token linked to email address, and delete if any
        const encryptedEmail = aes.encrypt(email)
        const existingResetToken = await this.resetTokenModel.findOne({'email': encryptedEmail}).exec()
        if (existingResetToken) {
            await this.resetTokenModel.deleteOne({'email': encryptedEmail}).exec()
        }

        //* placing the token creation logic in the if statement. This way, tokens are not created for emails addresses that don't exist in the database
        const existingUser = await this.usersService.getUserByEmailForPasswordResetAndChange(email)
        if(existingUser) {
            const token = await this.generateRandomTokenString()
            const encryptedToken = aes.encrypt(token)

            // storing encrypted email and token in database for security risk
            const resetToken = await this.resetTokenModel.create({'email': encryptedEmail, 'token': encryptedToken}) 
            resetToken.save()


            const emailResetPasswordData = {
                from: process.env.ELASTIC_EMAIL_FROM_EMAIL,
                to: [email,],
                subject: 'Reset Password',
                html: '<p>Click <a href="http://localhost:3000/api/v1/token/password-reset?token=' + token + '">here</a> to reset your password. Token is valid for 2 minutes.</p>'
            }
            emailSender.sendMail(emailResetPasswordData)
        }

        return { message: "Email sent. If the email address exist, you will be prompted." }
    }


    async confirmPasswordReset(token: string, password: string, confirmPassword: string) { 

        //* check expiration of token before doing anything else.

        const encryptedToken = aes.encrypt(token)

        const resetToken = await this.resetTokenModel.findOne({ token: encryptedToken})
        const decryptedResetTokenEmail = aes.decrypt(resetToken.email)
        await this.authService.changePassword(decryptedResetTokenEmail, password, confirmPassword)

        // dummy
        return {message: "password updated"}

    }
}
