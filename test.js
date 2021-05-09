const mysql = require('mysql');
const wrapper = require('node-mysql-wrapper');

const connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'yotv_stats'
});

const db = wrapper.wrap(connection);

db.ready(function () {
    //your code goes here
    //users -> an example table inside the database, just call it like property:
    console.log("Reached")
    db.table("users").find({limit: 50}).then(users => {
        console.log(users)
    });
    // db.table("users").find({limit: 50}, function (results) {
    //     console.log("Results",results);
    //     to destroy the whole connection, its events and its tables use:
    //     db.destroy();
    // }); //or using promises: findById(8).then(function(rowResults){...});
});
