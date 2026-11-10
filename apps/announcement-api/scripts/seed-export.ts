import 'reflect-metadata';
import 'dotenv/config';
import { existsSync, writeFileSync } from 'node:fs';
import mongoose from 'mongoose';
import { LOCAL_SEED_FILE, MessageModel, requireMongoUri, SeedMessage } from './seed-data';

// Read-only: rebuilds seed-data.local.json from the messages in the database,
// so the private stories never have to be typed again. Refuses to overwrite an
// existing file unless called with --force.
/** Writes every message in the database to seed-data.local.json. */
async function exportSeed() {
  const force = process.argv.includes('--force');
  if (existsSync(LOCAL_SEED_FILE) && !force) {
    throw new Error(`${LOCAL_SEED_FILE} already exists. Pass --force to overwrite it.`);
  }

  await mongoose.connect(requireMongoUri(), { dbName: 'announcement' });
  const docs = await MessageModel.find({}, { _id: 0, __v: 0, createdAt: 0, updatedAt: 0 })
    .sort({ createdAt: 1 })
    .lean<SeedMessage[]>();
  await mongoose.disconnect();

  // An empty result means a wrong URI or database, not an empty story list:
  // never replace the only copy of the stories with [].
  if (docs.length === 0) {
    throw new Error('The database returned no messages. Check MONGODB_URI; the local file was not changed.');
  }

  writeFileSync(LOCAL_SEED_FILE, JSON.stringify(docs, null, 2) + '\n');
  console.log(`Exported ${docs.length} messages to ${LOCAL_SEED_FILE}`);
}

exportSeed().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
