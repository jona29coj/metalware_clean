const {Pool} = require('pg');

const pool = new Pool({
    host: '51.21.33.66',
    user: 'postgres',
    password: 'elementsenergies1234',
    database: 'metalware',
    port: 5432,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000
})

module.exports = pool;