import { createGetEventsController } from '../../controllers/events';
import { EventDAL } from '../../dal/events.dal';
import { Event } from '../../entity/event';
import { Ticket } from '../../entity/ticket';

jest.mock('../../dal/events.dal', () => ({
  createEventDAL: jest.fn(),
}));

import { createEventDAL } from '../../dal/events.dal';

const makeEvent = (id: number, availableTickets: Ticket[] = []): Event => ({
  id,
  name: `event-${id}`,
  description: 'desc',
  location: 'city',
  date: new Date(),
  availableTickets,
  createdAt: new Date(),
  updatedAt: new Date(),
});

const makeTicket = (id: number, eventId: number): Ticket => ({
  id,
  eventId,
  type: 'general',
  status: 'available',
  price: 1000,
  createdAt: new Date(),
  updatedAt: new Date(),
});

const makeRes = () => {
  const res = {
    set: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  return res as unknown as { set: jest.Mock; json: jest.Mock };
};

describe('createGetEventsController', () => {
  const eventsDAL: jest.Mocked<EventDAL> = {
    getEvents: jest.fn(),
    countEvents: jest.fn(),
  };

  beforeEach(() => {
    (createEventDAL as jest.Mock).mockReturnValue(eventsDAL);
    eventsDAL.getEvents.mockResolvedValue([makeEvent(1, [makeTicket(10, 1)]), makeEvent(2)]);
    eventsDAL.countEvents.mockResolvedValue(42);
  });

  it('returns a bare array with pagination headers', async () => {
    const res = makeRes();
    await createGetEventsController()({ query: { page: '2', pageSize: '10' } } as never, res as never, jest.fn());

    expect(eventsDAL.getEvents).toHaveBeenCalledWith({ limit: 10, offset: 10, includeTickets: true });
    expect(res.set).toHaveBeenCalledWith('X-Total-Count', '42');
    expect(res.set).toHaveBeenCalledWith('X-Page', '2');
    expect(res.set).toHaveBeenCalledWith('X-Page-Size', '10');
    expect(res.set).toHaveBeenCalledWith('X-Total-Pages', '5');
    expect(res.json).toHaveBeenCalledWith([
      expect.objectContaining({ id: 1, availableTickets: [expect.objectContaining({ id: 10 })] }),
      expect.objectContaining({ id: 2, availableTickets: [] }),
    ]);
  });

  it('forwards validation errors to next', async () => {
    const next = jest.fn();
    await createGetEventsController()({ query: { page: '0' } } as never, makeRes() as never, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});
