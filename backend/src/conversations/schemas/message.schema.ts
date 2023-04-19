import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import * as mongoose from 'mongoose'
import { Room } from "./room.schema";


export type MessageDocument = Message & Document

@Schema({timestamps: true})
export class Message {
    // for message to contain any type of data
    @Prop({type: mongoose.Schema.Types.Mixed})
    content: any

    @Prop()
    sender: string;

    @Prop({type: Room})
    conversationRoom: Room
}

export const MessageSchema = SchemaFactory.createForClass(Message)