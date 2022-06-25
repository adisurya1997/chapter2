const {Pool} = require('pg')

const dbPool = new Pool({
    database: 'postgres',
    port: 5432,
    user: 'postgres',
    password: 'adisurya'
})

module.exports = dbPool