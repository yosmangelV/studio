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
const AUDIENCE_TYPES = new Set<string>(['special', 'friends', 'family']);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isOptionalString = (value: unknown): boolean => value === undefined || typeof value === 'string';

function isSeedSlide(value: unknown): value is SeedSlide {
  return (
    isRecord(value) &&
    typeof value['title'] === 'string' &&
    typeof value['body'] === 'string' &&
    typeof value['footer'] === 'string' &&
    typeof value['messageType'] === 'string' &&
    MESSAGE_TYPES.has(value['messageType']) &&
    isOptionalString(value['image']) &&
    isOptionalString(value['altText'])
  );
}

function isSeedMessage(value: unknown): value is SeedMessage {
  return (
    isRecord(value) &&
    typeof value['code'] === 'string' &&
    value['code'].trim() !== '' &&
    typeof value['audienceType'] === 'string' &&
    AUDIENCE_TYPES.has(value['audienceType']) &&
    (value['recipientName'] === null || typeof value['recipientName'] === 'string') &&
    (value['isActive'] === undefined || typeof value['isActive'] === 'boolean') &&
    Array.isArray(value['slides']) &&
    value['slides'].every(isSeedSlide)
  );
}

/**
 * Reads and checks a seed file before anything touches the database: a bad
 * message, slide or duplicate code fails here with the file and the position,
 * instead of after `seed.ts` has already deleted the codes it replaces.
 */
export function readSeedFile(path: string): SeedMessage[] {
  if (!existsSync(path)) {
    throw new Error(
      `Seed file not found: ${path}\n` +
        'Run `npm run seed:export` to rebuild it from the database, or copy seed-data.example.json.',
    );
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(readFileSync(path, 'utf8'));
  } catch (err) {
    throw new Error(`${path}: not valid JSON (${err instanceof Error ? err.message : String(err)})`);
  }
  if (!Array.isArray(parsed)) throw new Error(`${path}: expected an array of messages`);

  const messages: SeedMessage[] = [];
  const seen = new Set<string>();
  parsed.forEach((entry: unknown, i) => {
    if (!isSeedMessage(entry)) {
      throw new Error(
        `${path}: message ${i} needs a code, an audienceType (special, friends or family), ` +
          'a recipientName (string or null) and slides with title, body, footer and a known messageType',
      );
    }
    // The schema stores codes in upper case, so "abc" and "ABC" are the same message.
    const code = entry.code.toUpperCase();
    if (seen.has(code)) throw new Error(`${path}: code ${code} appears more than once`);
    seen.add(code);
    messages.push(entry);
  });
  return messages;
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

/** The connection string from `.env`; exits with a message when it is missing. */
export function requireMongoUri(): string {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('Missing MONGODB_URI in .env');
    process.exit(1);
  }
  return uri;
}
