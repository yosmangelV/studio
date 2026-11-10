import 'reflect-metadata';
import 'dotenv/config';
import mongoose from 'mongoose';
import { LOCAL_SEED_FILE, MessageModel, readSeedFile, requireMongoUri } from './seed-data';

// Writes the stories in seed-data.local.json (or the file passed as the first
// argument), replacing only the messages whose codes are in that file.
/** Replaces the codes in the seed file with its messages, after the whole file passes its checks. */
async function seed() {
  const messages = readSeedFile(process.argv[2] ?? LOCAL_SEED_FILE);
  await mongoose.connect(requireMongoUri(), { dbName: 'announcement' });
  console.log('Connected to MongoDB');

  const codes = messages.map((m) => m.code);
  await MessageModel.deleteMany({ code: { $in: codes } });
  console.log(`Cleared ${codes.length} codes`);

  await MessageModel.insertMany(messages);
  console.log(`Seeded ${messages.length} messages: ${codes.join(', ')}`);

  await mongoose.disconnect();
  console.log('Done.');
}

seed().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
