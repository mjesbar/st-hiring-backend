import { Collection } from 'mongodb';
import { createSettingsDAL, SETTINGS_ID } from '../../dal/settings.dal';
import { Settings } from '../../entity/settings';

const makeCollection = () => {
  const collection = {
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
  };
  return collection as unknown as jest.Mocked<Collection<Settings>>;
};

describe('createSettingsDAL', () => {
  it('reads the singleton document', async () => {
    const collection = makeCollection();
    const settings: Settings = { currency: 'USD', locale: 'en-US', timezone: 'UTC', updatedAt: new Date() };
    collection.findOne.mockResolvedValue(settings);

    await expect(createSettingsDAL(collection).get()).resolves.toBe(settings);
    expect(collection.findOne).toHaveBeenCalledWith({ _id: SETTINGS_ID });
  });

  it('upserts with a fresh updatedAt and returns the new document', async () => {
    const collection = makeCollection();
    const stored = { currency: 'EUR', locale: 'es-ES', timezone: 'UTC', updatedAt: new Date() };
    collection.findOneAndUpdate.mockResolvedValue(stored as never);

    const result = await createSettingsDAL(collection).upsert({ currency: 'EUR', locale: 'es-ES', timezone: 'UTC' });

    expect(result).toBe(stored);
    const [filter, update, options] = collection.findOneAndUpdate.mock.calls[0] as unknown as [
      unknown,
      unknown,
      unknown,
    ];
    expect(filter).toEqual({ _id: SETTINGS_ID });
    expect(update).toEqual({ $set: expect.objectContaining({ currency: 'EUR', locale: 'es-ES' }) });
    expect(options).toEqual({ upsert: true, returnDocument: 'after' });
  });
});
