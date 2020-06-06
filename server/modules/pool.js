const pg = require('pg');

const config = {
  database: 'to_do_list',
  host: 'localhost',
  port: 5432,
  max: 10,
  idleTimeoutMillis: 30000
};

const pool = new pg.Pool(config);

pool.on('connect', () => {
  console.log('Connected to postgres!');
});

pool.on('error', (err) => {
  console.log('Error connecting to postgres', err);
});

module.exports = pool;
