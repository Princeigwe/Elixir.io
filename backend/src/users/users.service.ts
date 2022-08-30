import { Injectable, HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import {Model} from 'mongoose'
import { InjectModel } from '@nestjs/mongoose';
import {User, UserDocument} from '../users/users.schema'
import {Role} from '../enums/role.enum'
import {UserCategory} from '../enums/user.category.enum'
import { EventEmitter2 } from '@nestjs/event-emitter';
import {NewUserEvent} from '../events/createProfileByUser.event'


@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        private eventEmitter: EventEmitter2
    ) {}

    /**
     * It creates a new user in the database if the email doesn't already exist
     * @param {string} email - string, password: string
     * @param {string} password - string - the password that the user will use to login
     * @returns The user object is being returned.
     */
    async createUser(email: string, password: string) {
        const existingUser = await this.userModel.findOne({ email: email}).exec()
        if (existingUser) { 
            throw new HttpException('User with this email already exists', HttpStatus.BAD_REQUEST) 
        }
        const user = new this.userModel({email: email, password: password});
        return user.save();
    }

    /**
     * It creates a new user with the role of Admin
     * @param {string} email - string, password: string
     * @param {string} password - string - the password that the user will use to login
     * @returns The user is being returned.
     */
    async createAdmin(email: string, password: string) {
        const existingUser = await this.userModel.findOne({email: email}).exec();
        if (existingUser) { 
            throw new HttpException('An user with this email already exists', HttpStatus.BAD_REQUEST) 
        }
        const role = Role.Admin
        const category = "__"
        const user = new this.userModel({email: email, password: password, role: role, category: category})
        return user.save()
    }


    // this method is creates a user as a patient
    async createUserPatient(email: string, password: string) {
        const existingUser = await this.userModel.findOne({email: email}).exec();
        if (existingUser) { 
            throw new HttpException('A user with this email already exists', HttpStatus.BAD_REQUEST) 
        }
        const user = new this.userModel({email: email, password: password});
        this.eventEmitter.emit('new.user', new NewUserEvent(user)) // event to create patient profile
        return user.save();
    }


    // this method create a user as a MedicalProvider
    async createUserMedicalProvider(email: string, password: string) {
        const existingUser = await this.userModel.findOne({email: email}).exec();
        if (existingUser) { 
            throw new HttpException('A user with this email already exists', HttpStatus.BAD_REQUEST) 
        }
        const category = UserCategory.MedicalProvider
        const user = new this.userModel({email: email, password: password, category: category})
        return user.save()
    }


    /**
     * It returns a list of users from the database
     * @returns An array of users
     */
    async getUsers() {
        const users =  await this.userModel.find().exec()
        if(!users.length) {throw new NotFoundException("Users Not Found")}
        return users
    }

    /**
     * It returns a user object if the user exists, otherwise it throws an error
     * @param {string} email - string - This is the email of the user we want to find.
     * @returns A user object
     */
    async getUserByEmail(email: string) {
        const user = await this.userModel.findOne({"email": email}).exec()
        if(!user) { throw new NotFoundException("User Not Found") }
        return user
    }

    /**
     * It returns a user object if the user exists, otherwise it throws an error
     * @param {any} _id - any
     * @returns The user object
     */
    async getUserByID(_id: any) {
        const user = await this.userModel.findOne({"_id": _id}).exec()
        if(!user) { throw new NotFoundException("User Not Found") }
        return user
    }

    /**
     * It deletes all users from the database
     */
    async deleteUsers() {
        await this.userModel.deleteMany().exec()
    }

    /**
     * It deletes a user from the database by email
     * @param {string} email - string - This is the email of the user that we want to delete.
     * @returns The user is being returned
     */
    async deleteUserByEmail(email: string) {
        await this.userModel.deleteOne({"email": email}).exec()
    }

    /**
     * This function deletes a user from the database by their ID
     * @param {any} _id - The id of the user to be deleted
     */
    async deleteUserByID(_id: any) {
        await this.userModel.deleteOne({"_id": _id}).exec()
    }

    // this method will be used to change or reset the user's password'
    async updateUser(password: string) {}
}
