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
  available_tickets: Ticket[] | null;
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
  availableTickets: row.available_tickets ?? [],
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const createEventDAL = (knex: Knex): EventDAL => ({
  async getEvents({ limit, offset, includeTickets = false }): Promise<Event[]> {
    const query = knex<EventRow>('events').select('events.*').orderBy('events.id').limit(limit).offset(offset);

    if (includeTickets) {
      query
        .leftJoin('tickets', function () {
          this.on('tickets.event_id', 'events.id').andOn('tickets.status', knex.raw('?', ['available']));
        })
        .select(
          knex.raw(
            `coalesce(json_agg(json_build_object(
              'id', tickets.id,
              'eventId', tickets.event_id,
              'type', tickets.type,
              'status', tickets.status,
              'price', tickets.price,
              'createdAt', tickets.created_at,
              'updatedAt', tickets.updated_at
            )) filter (where tickets.id is not null), '[]') as available_tickets`,
          ),
        )
        .groupBy('events.id');
    }

    const rows = await query;
    return rows.map(mapEvent);
  },

  async countEvents(): Promise<number> {
    const [{ count }] = await knex('events').count<{ count: string }[]>('* as count');
    return Number(count);
  },
});
