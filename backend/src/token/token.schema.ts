import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose'
import {Document} from 'mongoose'

export type ResetTokenDocument = ResetToken & Document

@Schema({timestamps: true})
export class ResetToken {

    @Prop()
    email: string

    @Prop()
    token: string

    @Prop({type: Boolean, default: false})
    isExpired: boolean

}

export const ResetTokenSchema = SchemaFactory.createForClass(ResetToken)