import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export interface Slide {
  title: string;
  body: string;
  image?: string;
  altText?: string;
  messageType: MessageType;
  footer: string;
}

export enum MessageType {
  INTRO = 'intro',
  FINAL_REVEAL = 'final-reveal',
  ULTRASOUND_REVEAL = 'ultrasound-reveal',
  TEXT = 'text',
  TEXT_IMAGE = 'text-image',
  COUNTDOWN = 'countdown',
  ENVELOPE = 'envelope',
  IMAGE = 'image',
}

export type MessageDocument = HydratedDocument<Message>;

@Schema({ timestamps: true, collection: 'messages' })
export class Message {
  @Prop({ required: true, unique: true, uppercase: true })
  code: string;

  @Prop({ required: true, enum: ['special', 'friends', 'family'] })
  audienceType: string;

  @Prop({ type: String, default: null })
  recipientName: string | null;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: [Object], required: true })
  slides: Slide[];
}

export const MessageSchema = SchemaFactory.createForClass(Message);
