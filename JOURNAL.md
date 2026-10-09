# Journal

# Features

- Ticket amount on `GET /events`: the `Event` entity now exposes `availableTickets`, `soldTickets` and `reservedTickets` as numbers, always returned. They are the per-status counts of the event's tickets, computed in the same query as the events page via `count(tickets.id) filter (where tickets.status = ...)` over a `leftJoin` + `groupBy events.id`. The old `availableTickets: Ticket[]` array was renamed to `tickets: Ticket[]` and is only included when `includeTickets=true` (all statuses), so the default payload carries just the three counts.

- `includeTickets` defaults to `false` in the controller (`req.query.includeTickets === 'true'`), so consumers opt in to the ticket array.

# Bugs

- `N+1` query in `GET /events`: `src/controllers/events.ts` ran one `getTicketsByEvent` call per event. With 50 events that is 51 round trips. Fixed by joining and aggregating tickets in the events query itself, controlled by the `includeTickets` param of `getEvents`.

- Entity and DB field mismatch: entities declared camelCase (`createdAt`, `updatedAt`, `eventId`) but Postgres returns snake_case (`created_at`, `updated_at`, `event_id`). The API leaked raw DB column names. Fixed with explicit row mappers in the DALs.

- Unhandled async errors: Express 4 does not catch rejected promises from async handlers, so a DB failure hangs the request. Controllers now use `try/catch` and forward to `next`, and `index.ts` has a terminal error middleware returning `500`.

- No input validation: `page`, `pageSize` and the settings body were unvalidated. Added a pagination parser and a settings validator.

- `POST /settings` required the full document: sending only `{ "currency": "EUR" }` returned `500`. Now only the provided fields are validated and merged via `$set`, so partial updates work.

- Scattered env vars: env vars were read ad hoc with fallbacks in `knexfile.ts`, `mongo.ts` and `index.ts`. Now all are loaded and validated once in `src/lib/env.ts` as `ENV`, and the service crashes at startup with a detailed list of missing vars.

- `Ticket.status` entity field could be a lot of values, so the typesafe orm restriction was added. Possible values `available`, `sold` or `reserved`.

# Performance

- Missing index on `tickets.event_id`: the FK is unindexed, so per-event ticket lookups do a sequential scan. Added an index migration with `(event_id)` and `(event_id, status)`.

- Seed inserts one row at a time: `events-tickets-seed.js` inserted 100 events plus 50k tickets one by one. Batched the ticket inserts with `batchInsert`.

# Code quality

- Hardcoded port: `3000` in `src/index.ts` is now `ENV.PORT`.

- Hardcoded limit: `getEvents(50)` magic number replaced by pagination params.

- Mixed module exports: `src/knexfile.ts` mixed `module.exports` and `export default`. Now a single export style.
