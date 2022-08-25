import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose'
import { Document } from 'mongoose'
import {Role} from '../enums/role.enum'

export type UserDocument = User & Document

@Schema()
export class User {

    @Prop()
    email: string

    @Prop()
    password: string

    @Prop({default: Role.User})
    role: string

}

export const UserSchema = SchemaFactory.createForClass(User)