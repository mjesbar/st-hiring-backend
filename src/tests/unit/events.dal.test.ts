import { createEventDAL, mapEvent } from '../../dal/events.dal';

/** Minimal knex query-builder stub recording the chained calls. */
const makeKnex = (rows: unknown[]) => {
  const builder = {
    select: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    offset: jest.fn().mockReturnThis(),
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
  available_tickets: '3',
  sold_tickets: '1',
  reserved_tickets: '2',
  tickets: null,
};

describe('mapEvent', () => {
  it('maps snake_case rows and coerces counts to numbers', () => {
    expect(mapEvent(eventRow)).toEqual({
      id: 1,
      name: 'Concert',
      description: 'desc',
      location: 'Madrid',
      date: eventRow.date,
      availableTickets: 3,
      soldTickets: 1,
      reservedTickets: 2,
      createdAt: eventRow.created_at,
      updatedAt: eventRow.updated_at,
    });
  });

  it('includes tickets only when present', () => {
    const tickets = [{ id: 5, eventId: 1 }] as never;
    expect(mapEvent({ ...eventRow, tickets }).tickets).toBe(tickets);
    expect(mapEvent(eventRow)).not.toHaveProperty('tickets');
  });
});

describe('createEventDAL', () => {
  it('runs a single query with counts, join, group and pagination', async () => {
    const { knex, builder } = makeKnex([eventRow]);
    const result = await createEventDAL(knex).getEvents({ limit: 10, offset: 20 });

    expect(builder.leftJoin).toHaveBeenCalledWith('tickets', 'tickets.event_id', 'events.id');
    expect(builder.groupBy).toHaveBeenCalledWith('events.id');
    expect(builder.limit).toHaveBeenCalledWith(10);
    expect(builder.offset).toHaveBeenCalledWith(20);
    expect(builder.select).toHaveBeenCalledTimes(2);
    expect(result[0]).toMatchObject({ availableTickets: 3, soldTickets: 1, reservedTickets: 2 });
    expect(result[0]).not.toHaveProperty('tickets');
  });

  it('adds the ticket list select when includeTickets is set', async () => {
    const { knex, builder } = makeKnex([{ ...eventRow, tickets: [{ id: 10 }] }]);
    const result = await createEventDAL(knex).getEvents({ limit: 10, offset: 0, includeTickets: true });

    expect(builder.select).toHaveBeenCalledTimes(3);
    expect(result[0].tickets).toEqual([{ id: 10 }]);
  });

  it('returns the numeric total', async () => {
    const { knex } = makeKnex([]);
    await expect(createEventDAL(knex).countEvents()).resolves.toBe(7);
  });
});
