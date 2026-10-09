/** Removes all events and tickets, resetting their id sequences. */
import knex from 'knex';
import dbConfig from '../knexfile';

const db = knex(dbConfig.development);

const clean = async (): Promise<void> => {
  await db.raw('TRUNCATE tickets, events RESTART IDENTITY CASCADE');
  console.log('Cleaned events and tickets.');
};

clean()
  .catch((error) => {
    console.error('Cleanup failed:', error);
    process.exitCode = 1;
  })
  .finally(() => db.destroy());
