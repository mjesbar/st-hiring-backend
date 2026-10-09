import { Collection, Db, MongoClient } from 'mongodb';
import { Settings } from '../entity/settings';
import { ENV } from '../lib/env';

const SETTINGS_COLLECTION = 'settings';
const SETTINGS_DB = 'seetickets';

let client: MongoClient | undefined;

/** Returns the settings collection, connecting lazily on first use. */
export const getSettingsCollection = async (): Promise<Collection<Settings>> => {
  if (!client) {
    client = new MongoClient(ENV.MONGO_URI);
    await client.connect();
  }
  const db: Db = client.db(SETTINGS_DB);
  return db.collection<Settings>(SETTINGS_COLLECTION);
};

/** Closes the shared Mongo client (used on shutdown and in tests). */
export const closeMongo = async (): Promise<void> => {
  await client?.close();
  client = undefined;
};
