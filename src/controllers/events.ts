import { NextFunction, Request, Response } from 'express';
import { knex } from 'knex';
import dbConfig from '../knexfile';
import { createEventDAL } from '../dal/events.dal';
import { parsePagination, totalPages } from '../lib/pagination';

export const createGetEventsController =
  () =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const eventsDAL = createEventDAL(knex(dbConfig.development));
      const { page, pageSize, offset, limit } = parsePagination(req.query as Record<string, unknown>);

      const [events, total] = await Promise.all([
        eventsDAL.getEvents({ limit, offset, includeTickets: true }),
        eventsDAL.countEvents(),
      ]);

      res
        .set('X-Total-Count', String(total))
        .set('X-Page', String(page))
        .set('X-Page-Size', String(pageSize))
        .set('X-Total-Pages', String(totalPages(total, pageSize)))
        .json(events);
    } catch (err) {
      next(err);
    }
  };
