const mysql = require('mysql');
const wrapper = require('node-mysql-wrapper');

const connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'yotv_stats'
});

const db = wrapper.wrap(connection);

module.exports = db;