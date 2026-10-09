import { createTicketDAL, mapTicket } from '../../dal/tickets.dal';

/** Minimal knex query-builder stub recording the chained calls. */
const makeKnex = (rows: unknown[]) => {
  const builder = {
    select: jest.fn().mockReturnThis(),
    where: jest.fn().mockResolvedValue(rows),
  };
  const knex = jest.fn().mockReturnValue(builder);
  return { knex: knex as never, builder };
};

const ticketRow = {
  id: 5,
  event_id: 1,
  type: 'general',
  status: 'available' as const,
  price: 1000,
  created_at: new Date('2025-01-01'),
  updated_at: new Date('2025-01-02'),
};

describe('mapTicket', () => {
  it('maps snake_case rows to camelCase entities', () => {
    expect(mapTicket(ticketRow)).toEqual({
      id: 5,
      eventId: 1,
      type: 'general',
      status: 'available',
      price: 1000,
      createdAt: ticketRow.created_at,
      updatedAt: ticketRow.updated_at,
    });
  });
});

describe('createTicketDAL', () => {
  it('filters by event id and maps rows', async () => {
    const { knex, builder } = makeKnex([ticketRow]);
    const result = await createTicketDAL(knex).getTicketsByEvent(1);

    expect(builder.where).toHaveBeenCalledWith('event_id', 1);
    expect(result).toHaveLength(1);
    expect(result[0].eventId).toBe(1);
  });
});
