import { NextFunction, Request, Response } from 'express';
import { createSettingsDAL } from '../dal/settings.dal';
import { getSettingsCollection } from '../database/mongo';

const isNonEmptyString = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0;

/** Validates and normalizes the settings payload, throwing on invalid input. */
const parseSettings = (body: unknown): { currency: string; locale: string; timezone: string } => {
  const { currency, locale, timezone } = (body ?? {}) as Record<string, unknown>;
  if (!isNonEmptyString(currency)) throw new Error('currency is required');
  if (!isNonEmptyString(locale)) throw new Error('locale is required');
  if (timezone === undefined) return { currency, locale, timezone: 'UTC' };
  if (!isNonEmptyString(timezone)) throw new Error('timezone must be a string');
  return { currency, locale, timezone };
};

export const createGetSettingsController =
  () =>
  async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const settingsDAL = createSettingsDAL(await getSettingsCollection());
      const settings = await settingsDAL.get();
      if (!settings) throw new Error('settings not found');
      res.json(settings);
    } catch (err) {
      next(err);
    }
  };

export const createPostSettingsController =
  () =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const settingsDAL = createSettingsDAL(await getSettingsCollection());
      const settings = await settingsDAL.upsert(parseSettings(req.body));
      res.json(settings);
    } catch (err) {
      next(err);
    }
  };
