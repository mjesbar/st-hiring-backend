import { Collection } from 'mongodb';
import { Settings } from '../entity/settings';

export const SETTINGS_ID = 'global';

export interface SettingsDAL {
  get(): Promise<Settings | null>;
  upsert(settings: Omit<Settings, 'updatedAt'>): Promise<Settings>;
}

export const createSettingsDAL = (collection: Collection<Settings>): SettingsDAL => ({
  async get(): Promise<Settings | null> {
    return collection.findOne({ _id: SETTINGS_ID } as never);
  },

  async upsert(settings): Promise<Settings> {
    const doc: Settings = { ...settings, updatedAt: new Date() };
    const result = await collection.findOneAndUpdate(
      { _id: SETTINGS_ID } as never,
      { $set: doc },
      { upsert: true, returnDocument: 'after' },
    );
    return result as Settings;
  },
});
