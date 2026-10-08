export type TicketStatus = 'available' | 'unavailable';

export interface Ticket {
  id: number;
  eventId: number;
  type: string;
  status: TicketStatus;
  price: number;
  createdAt: Date;
  updatedAt: Date;
}
