export type TicketStatus = 'available' | 'sold' | 'reserved';

export interface Ticket {
  id: number;
  eventId: number;
  type: string;
  status: TicketStatus;
  price: number;
  createdAt: Date;
  updatedAt: Date;
}
