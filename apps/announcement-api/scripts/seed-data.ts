import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import mongoose from 'mongoose';
import { MessageType } from '../src/messages/schemas/message.schema';

/**
 * The real stories hold private data (names, photos), so they live in a
 * gitignored file on the owner's machine. `seed-data.example.json` shows the
 * shape with invented content.
 */
export const LOCAL_SEED_FILE = join(__dirname, 'seed-data.local.json');
export const EXAMPLE_SEED_FILE = join(__dirname, 'seed-data.example.json');

export type SeedSlide = {
  title: string;
  body: string;
  image?: string;
  altText?: string;
  messageType: MessageType;
  footer: string;
};

export type SeedMessage = {
  code: string;
  audienceType: 'special' | 'friends' | 'family';
  recipientName: string | null;
  isActive?: boolean;
  slides: SeedSlide[];
};

const MESSAGE_TYPES = new Set<string>(Object.values(MessageType));

/** Reads and checks a seed file, failing with the file and slide that is wrong. */
export function readSeedFile(path: string): SeedMessage[] {
  if (!existsSync(path)) {
    throw new Error(
      `Seed file not found: ${path}\n` +
        'Run `npm run seed:export` to rebuild it from the database, or copy seed-data.example.json.',
    );
  }
  const messages: unknown = JSON.parse(readFileSync(path, 'utf8'));
  if (!Array.isArray(messages)) throw new Error(`${path}: expected an array of messages`);

  messages.forEach((message: SeedMessage, i) => {
    if (!message?.code || !Array.isArray(message.slides)) {
      throw new Error(`${path}: message ${i} needs a code and a slides array`);
    }
    message.slides.forEach((slide, j) => {
      if (!MESSAGE_TYPES.has(slide.messageType)) {
        throw new Error(`${path}: ${message.code} slide ${j} has an unknown messageType "${slide.messageType}"`);
      }
    });
  });
  return messages as SeedMessage[];
}

export const MessageSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true },
    audienceType: { type: String, required: true },
    recipientName: { type: String, default: null },
    isActive: { type: Boolean, default: true },
    slides: { type: [Object], required: true },
  },
  { timestamps: true },
);

export const MessageModel = mongoose.model('Message', MessageSchema, 'messages');

export function requireMongoUri(): string {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('Missing MONGODB_URI in .env');
    process.exit(1);
  }
  return uri;
}
