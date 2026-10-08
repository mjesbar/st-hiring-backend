import { Knex } from 'knex';
import { Ticket, TicketStatus } from '../entity/ticket';

export interface TicketRow {
  id: number;
  event_id: number;
  type: string;
  status: TicketStatus;
  price: number;
  created_at: Date;
  updated_at: Date;
}

export interface TicketsDAL {
  getTicketsByEvent(eventId: number): Promise<Ticket[]>;
}

/** Maps a raw snake_case tickets row to the API Ticket shape. */
export const mapTicket = (row: TicketRow): Ticket => ({
  id: row.id,
  eventId: row.event_id,
  type: row.type,
  status: row.status,
  price: row.price,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const createTicketDAL = (knex: Knex): TicketsDAL => ({
  async getTicketsByEvent(eventId): Promise<Ticket[]> {
    const rows = await knex<TicketRow>('tickets').select('*').where('event_id', eventId);
    return rows.map(mapTicket);
  },
});
