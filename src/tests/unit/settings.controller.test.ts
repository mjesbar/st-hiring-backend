import { createGetSettingsController, createPostSettingsController } from '../../controllers/settings';
import { SettingsDAL } from '../../dal/settings.dal';
import { Settings } from '../../entity/settings';

jest.mock('../../dal/settings.dal', () => ({
  createSettingsDAL: jest.fn(),
}));
jest.mock('../../database/mongo', () => ({
  getSettingsCollection: jest.fn().mockResolvedValue({}),
}));

import { createSettingsDAL } from '../../dal/settings.dal';

const makeRes = () => {
  const res = { json: jest.fn().mockReturnThis() };
  return res as unknown as { json: jest.Mock };
};

const makeDAL = (): jest.Mocked<SettingsDAL> => ({
  get: jest.fn(),
  upsert: jest.fn(),
});

const settings: Settings = { currency: 'USD', locale: 'en-US', timezone: 'UTC', updatedAt: new Date() };

describe('createGetSettingsController', () => {
  const settingsDAL = makeDAL();

  beforeEach(() => {
    (createSettingsDAL as jest.Mock).mockReturnValue(settingsDAL);
  });

  it('returns the settings document', async () => {
    settingsDAL.get.mockResolvedValue(settings);
    const res = makeRes();

    await createGetSettingsController()({} as never, res as never, jest.fn());
    expect(res.json).toHaveBeenCalledWith(settings);
  });

  it('forwards a 404 to next when no document exists', async () => {
    settingsDAL.get.mockResolvedValue(null);
    const next = jest.fn();

    await createGetSettingsController()({} as never, makeRes() as never, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});

describe('createPostSettingsController', () => {
  const settingsDAL = makeDAL();

  beforeEach(() => {
    (createSettingsDAL as jest.Mock).mockReturnValue(settingsDAL);
  });

  it('validates and upserts the payload', async () => {
    settingsDAL.upsert.mockResolvedValue(settings);
    const res = makeRes();

    await createPostSettingsController()({ body: { currency: 'USD', locale: 'en-US' } } as never, res as never, jest.fn());

    expect(settingsDAL.upsert).toHaveBeenCalledWith({ currency: 'USD', locale: 'en-US', timezone: 'UTC' });
    expect(res.json).toHaveBeenCalledWith(settings);
  });

  it.each([
    ['missing currency', { locale: 'en-US' }],
    ['missing locale', { currency: 'USD' }],
    ['blank currency', { currency: '  ', locale: 'en-US' }],
  ])('forwards %s as an error to next', async (_label, body) => {
    const next = jest.fn();
    await createPostSettingsController()({ body } as never, makeRes() as never, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(settingsDAL.upsert).not.toHaveBeenCalled();
  });
});
