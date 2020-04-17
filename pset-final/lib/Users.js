const Pool = require('pg-pool');

// Connect to DB
const pool = new Pool({
    host: 'localhost',
    port: 54320,
    database: 'finalproject',
    user: 'postgres',
    password: '12345',
});
pool.on('error', function (err) {
    console.log('idle client error', err.message, err.stack)
})

function createTable() {
    pool.query(`CREATE TABLE IF NOT EXISTS users (
        id UUID NOT NULL,
        name VARCHAR(128) NOT NULL,
        email VARCHAR(128) NOT NULL,
        password VARCHAR(60) NOT NULL,
        time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT users_pkey PRIMARY KEY(id) )
        WITH (oids = false);`);
}

module.exports = {
    pool: pool,
    createTable: createTable
};