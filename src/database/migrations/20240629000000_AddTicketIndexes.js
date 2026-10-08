/**
 * Adds indexes backing the per-event ticket lookups used by GET /events.
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.alterTable('tickets', (table) => {
    table.index('event_id', 'tickets_event_id_index');
    table.index(['event_id', 'status'], 'tickets_event_id_status_index');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable('tickets', (table) => {
    table.dropIndex('event_id', 'tickets_event_id_index');
    table.dropIndex(['event_id', 'status'], 'tickets_event_id_status_index');
  });
};
