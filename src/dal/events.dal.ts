import { Knex } from 'knex';
import { Event } from '../entity/event';
import { Ticket } from '../entity/ticket';

export interface EventRow {
  id: number;
  name: string;
  description: string;
  location: string;
  date: Date;
  created_at: Date;
  updated_at: Date;
  available_tickets: number | string;
  sold_tickets: number | string;
  reserved_tickets: number | string;
  tickets: Ticket[] | null;
}

export interface GetEventsParams {
  limit: number;
  offset: number;
  includeTickets?: boolean;
}

export interface EventDAL {
  getEvents(params: GetEventsParams): Promise<Event[]>;
  countEvents(): Promise<number>;
}

/** Maps a raw snake_case events row to the API Event shape. */
export const mapEvent = (row: EventRow): Event => ({
  id: row.id,
  name: row.name,
  description: row.description,
  location: row.location,
  date: row.date,
  availableTickets: Number(row.available_tickets),
  soldTickets: Number(row.sold_tickets),
  reservedTickets: Number(row.reserved_tickets),
  ...(row.tickets ? { tickets: row.tickets } : {}),
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const createEventDAL = (knex: Knex): EventDAL => ({
  async getEvents({ limit, offset, includeTickets = false }): Promise<Event[]> {
    const query = knex<EventRow>('events')
      .select('events.*')
      .select(
        knex.raw(
          `count(tickets.id) filter (where tickets.status = 'available') as available_tickets,
           count(tickets.id) filter (where tickets.status = 'sold') as sold_tickets,
           count(tickets.id) filter (where tickets.status = 'reserved') as reserved_tickets`,
        ),
      )
      .leftJoin('tickets', 'tickets.event_id', 'events.id')
      .groupBy('events.id')
      .orderBy('events.id')
      .limit(limit)
      .offset(offset);

    if (includeTickets) {
      query.select(
        knex.raw(
          `coalesce(json_agg(json_build_object(
            'id', tickets.id,
            'eventId', tickets.event_id,
            'type', tickets.type,
            'status', tickets.status,
            'price', tickets.price,
            'createdAt', tickets.created_at,
            'updatedAt', tickets.updated_at
          )) filter (where tickets.id is not null), '[]') as tickets`,
        ),
      );
    }

    const rows = await query;
    return rows.map(mapEvent);
  },

  async countEvents(): Promise<number> {
    const [{ count }] = await knex('events').count<{ count: string }[]>('* as count');
    return Number(count);
  },
});
