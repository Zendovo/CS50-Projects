const Pool = require('pg-pool');

var connectionString = 'postgres://wpoqlxzmptbvdq:b6e3419d0bf3a8c4876adc5560f486296037953a249d12de6c3d9ebb3f42e1a3@ec2-34-197-212-240.compute-1.amazonaws.com:5432/dbevlbkpv60736'

// Connect to DB
const pool = new Pool({
    connectionString: connectionString,
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
        timezone VARCHAR(128) NOT NULL DEFAULT 'Europe/London',
        time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT users_pkey PRIMARY KEY(id) )
        WITH (oids = false);`);

    pool.query(`CREATE TABLE IF NOT EXISTS schedules (
        id BIGSERIAL NOT NULL PRIMARY KEY,
        user_id UUID NOT NULL,
        schedule VARCHAR(1024) NOT NULL,
        name VARCHAR(128) );`)

    pool.query(`CREATE TABLE IF NOT EXISTS friends (
        id BIGSERIAL NOT NULL PRIMARY KEY,
        user_id UUID NOT NULL,
        friend_id UUID NOT NULL,
        timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP );`);

    pool.query(`CREATE TABLE IF NOT EXISTS friend_requests (
        id BIGSERIAL NOT NULL PRIMARY KEY,
        sender_id UUID NOT NULL,
        receiver_id UUID NOT NULL,
        timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP );`);

    pool.query(`CREATE TABLE IF NOT EXISTS friend_request_code (                                                                    
        user_id UUID NOT NULL PRIMARY KEY,
        code CHAR(6) UNIQUE NOT NULL );`);
}

module.exports = {
    pool: pool,
    createTable: createTable
};