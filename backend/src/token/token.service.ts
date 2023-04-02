import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import {Model } from 'mongoose'
import { InjectModel } from '@nestjs/mongoose';
import {ResetToken, ResetTokenDocument} from './token.schema'
const crypto = require('crypto');
import {EmailSender} from '../email/transporter' 
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { AuthService } from '../auth/auth.service';




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
        const existingResetToken = await this.resetTokenModel.findOne({'email': email}).exec()
        if (existingResetToken) {
            await this.resetTokenModel.deleteOne({'email': email}).exec()
        }

        const token = await this.generateRandomTokenString()
        const resetToken = await this.resetTokenModel.create({'email': email, 'token': token})
        resetToken.save()


        const emailResetPasswordData = {
            from: process.env.ELASTIC_EMAIL_FROM_EMAIL,
            to: [email,],
            subject: 'Reset Password',
            html: '<p>Click <a href="http://localhost:3000/api/v1/token/password-reset?token=' + token + '">here</a> to reset your password. Token is valid for 2 minutes.</p>'
        }
        // actually sending the email if the user with the email address exists
        const emailAddress = await this.usersService.getUserByEmailForPasswordResetAndChange(email)
        if(emailAddress) {
            emailSender.sendMail(emailResetPasswordData)
        }

        return { message: "Please check your email to reset your password" }
    }


    async confirmPasswordReset(token: string, password: string, confirmPassword: string) { 

        //* check expiration of token before doing anything else.

        const resetToken = await this.resetTokenModel.findOne({ token: token})
        await this.authService.changePassword(resetToken.email, password, confirmPassword)

        // dummy
        return {message: "password updated"}

    }
}
