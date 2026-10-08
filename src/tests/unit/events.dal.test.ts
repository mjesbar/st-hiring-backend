import { createEventDAL, mapEvent } from '../../dal/events.dal';

/** Minimal knex query-builder stub recording the chained calls. */
const makeKnex = (rows: unknown[]) => {
  const builder = {
    select: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    offset: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    then: (resolve: (value: unknown[]) => unknown) => Promise.resolve(rows).then(resolve),
    count: jest.fn().mockResolvedValue([{ count: '7' }]),
  };
  const knex = Object.assign(jest.fn().mockReturnValue(builder), { raw: jest.fn((sql: string) => sql) });
  return { knex: knex as never, builder };
};

const eventRow = {
  id: 1,
  name: 'Concert',
  description: 'desc',
  location: 'Madrid',
  date: new Date('2026-01-01'),
  created_at: new Date('2025-01-01'),
  updated_at: new Date('2025-01-02'),
  available_tickets: null,
};

describe('mapEvent', () => {
  it('maps snake_case rows to camelCase entities', () => {
    expect(mapEvent(eventRow)).toEqual({
      id: 1,
      name: 'Concert',
      description: 'desc',
      location: 'Madrid',
      date: eventRow.date,
      availableTickets: [],
      createdAt: eventRow.created_at,
      updatedAt: eventRow.updated_at,
    });
  });

  it('keeps joined tickets when present', () => {
    const tickets = [{ id: 5, eventId: 1 }] as never;
    expect(mapEvent({ ...eventRow, available_tickets: tickets }).availableTickets).toBe(tickets);
  });
});

describe('createEventDAL', () => {
  it('applies limit and offset and maps rows', async () => {
    const { knex, builder } = makeKnex([eventRow]);
    const result = await createEventDAL(knex).getEvents({ limit: 10, offset: 20 });

    expect(builder.limit).toHaveBeenCalledWith(10);
    expect(builder.offset).toHaveBeenCalledWith(20);
    expect(builder.leftJoin).not.toHaveBeenCalled();
    expect(result).toHaveLength(1);
    expect(result[0].createdAt).toBe(eventRow.created_at);
  });

  it('joins and aggregates tickets in a single query when includeTickets is set', async () => {
    const { knex, builder } = makeKnex([eventRow]);
    await createEventDAL(knex).getEvents({ limit: 10, offset: 0, includeTickets: true });

    expect(builder.leftJoin).toHaveBeenCalledTimes(1);
    expect(builder.groupBy).toHaveBeenCalledWith('events.id');
    expect(builder.select).toHaveBeenCalledTimes(2);
  });

  it('returns the numeric total', async () => {
    const { knex } = makeKnex([]);
    await expect(createEventDAL(knex).countEvents()).resolves.toBe(7);
  });
});
