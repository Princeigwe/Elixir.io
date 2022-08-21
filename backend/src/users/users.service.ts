import { Injectable, HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import {Model} from 'mongoose'
import { InjectModel } from '@nestjs/mongoose';
import {User, UserDocument} from '../users/users.schema'

@Injectable()
export class UsersService {
    constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

    /**
     * It creates a new user with the given email and password, and then saves it to the database
     * @param {string} email - string - This is the email of the user.
     * @param {string} password - string - This is the password that the user will use to login.
     * @returns A promise.
     */
    async createUser(email: string, password: string) {
        const user = new this.userModel({email: email, password: password});
        return user.save();
    }

    async getUsers() {
        return this.userModel.find().exec()
    }

    async getUserByEmail(email: string) {
        const user = await this.userModel.findOne({"email": email}).exec()
        if(!user) { throw new NotFoundException("User Not Found") }
        return user
    }

    async deleteUsers() {}

    /**
     * It deletes a user from the database by email
     * @param {string} email - string - This is the email of the user that we want to delete.
     * @returns The user is being returned
     */
    async deleteUserByEmail(email?: string) {
        await this.userModel.deleteOne({"email": email})
    }
}
