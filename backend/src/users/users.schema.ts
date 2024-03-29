import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose'
import {Exclude} from 'class-transformer'
import { Document } from 'mongoose'
import {Role} from '../enums/role.enum'
import { UserCategory } from '../enums/user.category.enum'
import { ExcludeProperty } from 'nestjs-mongoose-exclude'

export type UserDocument = User & Document

@Schema()
export class User {

    @Prop()
    email: string

    @ExcludeProperty()
    @Prop()
    password: string

    @Prop({default: Role.User})
    role: Role

    @Prop({default: UserCategory.Patient})
    category: UserCategory

}

export const UserSchema = SchemaFactory.createForClass(User)