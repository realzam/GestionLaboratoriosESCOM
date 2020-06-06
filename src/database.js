require('dotenv').config();
var mysql = require('mysql');
var mysqlConnection;

function handleDisconnect () {
  mysqlConnection = mysql.createConnection({
    host: process.env.HOST_DB,
    user: process.env.USER_DB,
    password: process.env.PASSWORD_DB,
    database:process.env.DB
  });
  mysqlConnection.connect(function (err) {
    if (err) {
      setTimeout(handleDisconnect, 2000); 
    } 
  }); 
  
  mysqlConnection.on('error', function (err) {
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      console.error('Database connection was closed.');
      handleDisconnect();
    }
    if (err.code === 'ER_CON_COUNT_ERROR') {
      console.error('Database has to many connections');
      handleDisconnect();
    }
    if (err.code === 'ECONNREFUSED') {
      console.error('Database connection was refused');
      handleDisconnect();
    }
  });
}
handleDisconnect();

mysqlConnection.query('USE '+process.env.HOST_DB);
console.log('connected to the database');
setInterval(function () {
  mysqlConnection.query('SELECT 1');
}, 1000*60);

module.exports = mysqlConnection;
