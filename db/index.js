const mysql = require('mysql');
const wrapper = require('node-mysql-wrapper');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: ''
});

const db = wrapper.wrap(connection);